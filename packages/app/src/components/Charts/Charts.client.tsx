'use client';

import { Box, Card } from '@radix-ui/themes';
import ReactECharts from 'echarts-for-react';

export const Charts = ({ data }: { data: Record<string, unknown> }) => {
    return (
        <Box my="2" maxWidth="90%">
            <Card>
                <ReactECharts
                    option={data}
                    style={{ height: 400 }}
                />
            </Card>
        </Box>
    );
}

export default Charts;