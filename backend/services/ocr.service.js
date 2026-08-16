/**
 * OCR Service — Business logic for receipt scanning and parsing.
 *
 * Hugging Face recognizes text, Groq interprets it, and the backend validates
 * the result before it reaches the editable confirmation form.
 */

const ocrRepository = require("../repositories/ocr.repository");
const fs = require("fs/promises");
const config = require("../config");
const receiptPipeline = require("./receiptPipeline.service");
const analyticsService = require("./analytics.service");
const transactionService = require("./transaction.service");
const { NotFoundError, BadRequestError } = require("../utils/errors");

class OcrService {
  async uploadAndProcess(userId, file) {
    if (!file) {
      throw new BadRequestError("Image file is required");
    }

    const imageData = await fs.readFile(file.path);

    const scan = await ocrRepository.create(userId, {
      imageUrl: `/${config.upload.dir}/${file.filename}`,
      imageData,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    const scanId = scan.ocr_id || scan.id;
    // Trigger async OCR processing (non-blocking)
    this._processAsync(scanId, userId, file);

    return scan;
  }

  async getScan(id, userId) {
    const scan = await ocrRepository.findById(id, userId);
    if (!scan) {
      throw new NotFoundError("OCR scan not found");
    }
    return scan;
  }

  async getScans(userId, pagination) {
    return ocrRepository.findByUser(userId, pagination);
  }

  /**
   * Create a transaction from a completed OCR scan after user confirmation.
   */
  async confirmTransaction(scanId, userId, data) {
    const scan = await this.getScan(scanId, userId);
    const input = this._normalizeTransactionInput(data);

    if (scan.transaction_id) {
      throw new BadRequestError("OCR scan is already linked to a transaction");
    }

    if (scan.status !== "completed") {
      throw new BadRequestError(
        "OCR scan must be completed before creating a transaction",
      );
    }

    const parsedData = this._getParsedData(scan);

    if (parsedData.isExpense === false && input.source === "ocr") {
      throw new BadRequestError(
        "Bukti ini terdeteksi sebagai transfer antarakun atau top-up saldo sendiri. Beralih ke input manual jika tetap ingin mencatatnya.",
      );
    }
    const amount = Number(input.amount ?? parsedData.total);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestError(
        "Transaction amount is required. Provide amount or wait for OCR total result.",
      );
    }

    const description =
      input.description || parsedData.description || this._buildReceiptDescription(parsedData);
    let categoryGroup =
      input.categoryGroup ||
      parsedData.categoryGroup ||
      parsedData.category_group ||
      null;
    let categoryDetail =
      input.categoryDetail ||
      parsedData.categoryDetail ||
      parsedData.category_detail ||
      null;

    if (!categoryGroup) {
      const category = await analyticsService.categorize(userId, {
        text: [scan.raw_text, description, parsedData.merchant]
          .filter(Boolean)
          .join(" "),
      });
      categoryGroup = category.predictedCategory;
      categoryDetail = category.categoryDetail || categoryDetail;
    }

    const transaction = await transactionService.create(userId, {
      accountId: input.accountId,
      ocrScanId: scan.ocr_id || scan.id,
      categoryGroup,
      categoryDetail,
      transactionDate: input.transactionDate || parsedData.date || new Date(),
      description,
      source: input.source || "ocr",
      amount,
    });

    const linkedScan = await ocrRepository.findById(scan.ocr_id || scan.id, userId);

    return {
      transaction,
      scan: linkedScan,
    };
  }

  /**
   * Process OCR in the background.
   */
  async _processAsync(scanId, userId, file) {
    try {
      await ocrRepository.updateStatus(scanId, "processing");

      const parsedData = await this._extractReceipt(file);

      await ocrRepository.updateStatus(scanId, "completed", parsedData);
    } catch (err) {
      try {
        await ocrRepository.updateStatus(scanId, "failed", this._failedParsedData(err));
      } catch (fallbackErr) {
        await ocrRepository.updateStatus(scanId, "failed", {
          errorMessage: fallbackErr.message,
        });
      }
    }
  }

  async _extractReceipt(file) {
    return receiptPipeline.extract(file);
  }

  async _attachCategory(userId, parsedData) {
    if (parsedData.data?.categoryGroup) return;

    const categoryText = [
      parsedData.rawText,
      parsedData.data?.merchant,
      ...(parsedData.data?.items || []).map((item) => item.name),
    ]
      .filter(Boolean)
      .join(" ");

    if (!categoryText) return;

    const category = await analyticsService.categorize(userId, {
      text: categoryText,
    });
    parsedData.data = parsedData.data || {};
    parsedData.data.categoryGroup = category.predictedCategory;
    parsedData.data.categoryDetail = category.categoryDetail;
    parsedData.data.categoryConfidence = category.confidence;
    parsedData.data.categorySource = category.source;
  }

  _getParsedData(scan) {
    if (!scan.parsed_data) return {};
    if (typeof scan.parsed_data === "string") {
      try {
        return JSON.parse(scan.parsed_data);
      } catch (_err) {
        return {};
      }
    }
    return scan.parsed_data;
  }

  _normalizeTransactionInput(data = {}) {
    return {
      ...data,
      accountId: data.accountId ?? data.account_id ?? null,
      categoryGroup: data.categoryGroup ?? data.category_group ?? data.budgetGroup ?? data.budget_group ?? null,
      categoryDetail: data.categoryDetail ?? data.category_detail ?? data.category ?? null,
      transactionDate: data.transactionDate ?? data.transaction_date ?? data.date ?? undefined,
      description: data.description ?? data.name ?? data.merchant ?? data.note ?? null,
      source: data.source || "ocr",
      amount: data.amount,
    };
  }

  _buildReceiptDescription(parsedData) {
    const merchant = parsedData.expenseName || parsedData.merchant || "OCR receipt";
    const items = Array.isArray(parsedData.items)
      ? parsedData.items
          .map((item) => item.name)
          .filter(Boolean)
          .slice(0, 3)
      : [];

    return [merchant, items.length ? items.join(", ") : null]
      .filter(Boolean)
      .join(" - ")
      .slice(0, 500);
  }

  _failedParsedData(error) {
    const message = error?.message || String(error) || "OCR processing failed";

    return {
      rawText: "",
      data: {
        fallbackReason: message,
      },
      confidence: 0,
      errorMessage: message,
    };
  }
}

module.exports = new OcrService();
