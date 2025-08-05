'use client';

import { Box, Card } from '@radix-ui/themes';
import ReactECharts from 'echarts-for-react';

// TODO: fix types
export const Charts = ({ data: { title, xAxis, series } }: { data: Record<string, any> }) => {
    return (
        <Box my="2" maxWidth="90%">
            <Card>
                <ReactECharts
                    option={{
                        "title": { "text": title },
                        "tooltip": {
                            "trigger": "axis",
                        },
                        "grid": {
                            "left": "3%",
                            "right": "4%",
                            "bottom": "3%",
                            "containLabel": true
                        },
                        "toolbox": {
                            "feature": {
                                "saveAsImage": {}
                            }
                        },
                        "xAxis": { "type": "category", "data": xAxis },
                        "yAxis": { "type": "value" },
                        "series": series
                    }}
                    style={{ height: 400 }}
                    lazyUpdate={true}
                />
            </Card>
        </Box>
    );
}

export default Charts;