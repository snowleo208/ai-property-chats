'use client';
import { Skeleton } from '@radix-ui/themes';
import ReactECharts from 'echarts-for-react';
import { useEffect, useState } from 'react';

export const Charts = ({ data }: { data: string }) => {
    const [isChartLoading, setIsChartLoading] = useState(true);
    const [renderableChartJson, setRenderableChartJson] = useState<string | null>(null);

    useEffect(() => {
        if (!data) {
            return;
        }

        try {
            console.log(data)
            const parsedData = JSON.parse(data);
            setRenderableChartJson(parsedData);
            setIsChartLoading(false);
        } catch {
            setRenderableChartJson(null);
            setIsChartLoading(true);
            return;
        }
    }, [data]);

    if (isChartLoading) {
        return <Skeleton width="100%" height="400" />;
    }

    if (!renderableChartJson) {
        return;
    }

    return <ReactECharts
        option={renderableChartJson}
        style={{ height: 400 }}
        lazyUpdate={true}
        showLoading={isChartLoading}
    />;
}

export default Charts;