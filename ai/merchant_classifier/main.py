
from typing import Optional
from fastapi import FastAPI
from pydantic import BaseModel, Field
from inference import SADARMerchantClassifier

app = FastAPI(title='SADAR Merchant Classifier API', version='1.0.0')
classifier = SADARMerchantClassifier(base_dir='.')

class TransactionRequest(BaseModel):
    merchant: str = Field(..., example='Kopi Senja')
    amount: float = Field(..., example=35000)
    date: Optional[str] = Field(None, example='2026-05-29 12:30:00')
    payment_method: str = Field('unknown', example='QRIS')
    payment_media: str = Field('unknown', example='mobile_banking')
    source: str = Field('manual', example='manual')

@app.get('/')
def root():
    return {'status': 'ok', 'service': 'SADAR Merchant Classifier API'}

@app.get('/health')
def health():
    return {'status': 'healthy'}

@app.post('/predict')
def predict(payload: TransactionRequest):
    return classifier.predict_one(
        merchant=payload.merchant,
        amount=payload.amount,
        date=payload.date,
        payment_method=payload.payment_method,
        payment_media=payload.payment_media,
        source=payload.source,
    )
