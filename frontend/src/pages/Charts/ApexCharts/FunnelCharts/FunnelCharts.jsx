import React from 'react';
import ReactApexChart from "react-apexcharts";

import getChartColorsArray from "../../../../Components/Common/ChartsDynamicColor";

const FunnelChartCode = ({ dataColors }) => {
    var funnelChartColors = getChartColorsArray(dataColors);
    const series = [
        {
            name: "Funnel Series",
            data: [1380, 1100, 990, 880, 740, 548, 330, 200],
        },
    ];
    const options = {
        chart: {
            type: 'bar',
            height: 350,
        },
        colors: funnelChartColors,
        plotOptions: {
            bar: {
                borderRadius: 0,
                horizontal: true,
                barHeight: '80%',
                isFunnel: true,
            },
        },
        dataLabels: {
            enabled: true,
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
            },
            dropShadow: {
                enabled: true,
            },
        },
        title: {
            text: 'Recruitment Funnel',
            align: 'middle',
        },
        xaxis: {
            categories: [
                'Sourced',
                'Screened',
                'Assessed',
                'HR Interview',
                'Technical',
                'Verify',
                'Offered',
                'Hired',
            ],
        },
        legend: {
            show: false,
        },
    }

    return (
        <ReactApexChart dir="ltr" className="apex-charts"
            series={series}
            options={options}
            type="bar"
            height={350}
        />
    );

}

const PyramidChartCode = ({ dataColors }) => {
    var pyramidChartColors = getChartColorsArray(dataColors);
    const series = [
        {
            name: "",
            data: [200, 330, 548, 740, 880, 990, 1100, 1380],
        },
    ];
    const options = {
        chart: {
            type: 'bar',
            height: 350,
        },
        plotOptions: {
            bar: {
                borderRadius: 0,
                horizontal: true,
                distributed: true,
                barHeight: '80%',
                isFunnel: true,
            },
        },
        colors: pyramidChartColors,
        dataLabels: {
            enabled: true,
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex]
            },
            dropShadow: {
                enabled: true,
            },
        },
        title: {
            text: 'Pyramid Chart',
            align: 'middle',
        },
        xaxis: {
            categories: ['Sweets', 'Processed Foods', 'Healthy Fats', 'Meat', 'Beans & Legumes', 'Dairy', 'Fruits & Vegetables', 'Grains'],
        },
        legend: {
            show: false,
        },
    }

    return (
        <ReactApexChart dir="ltr" className="apex-charts"
            series={series}
            options={options}
            type="bar"
            height={350}
        />
    );

}


export { FunnelChartCode, PyramidChartCode }