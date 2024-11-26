import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { Colors } from '../../contrast/Colors';
import { revenueByDay, revenueByMonth } from '../../services/api/dashboardApi';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

export default function Dashboard() {
    const [dailyRevenue, setDailyRevenue] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tooltipPos, setTooltipPos] = useState({ visible: false, value: 0, x: 0, y: 0 });

    const navigation = useNavigation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const dailyData = await revenueByDay('2024-10-24', '2024-10-31');
                const monthlyData = await revenueByMonth('2024');
                setDailyRevenue(dailyData);
                setMonthlyRevenue(monthlyData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const dailyChartData = {
        labels: dailyRevenue.map(item => moment(item.date).format('DD')),
        datasets: [
            {
                data: dailyRevenue.map(item => Math.round(item.total / 1_000_000)),
                color: () => Colors.primary,
            },
        ],
    };

    const monthlyChartData = {
        labels: monthlyRevenue.map(item => moment(item.month).format('MM')),
        datasets: [
            {
                data: monthlyRevenue.map(item => Math.round(item.total / 1_000_000)),
                color: () => Colors.secondary,
            },
        ],
    };

    const chartConfig = {
        backgroundGradientFrom: Colors.white,
        backgroundGradientTo: Colors.white,
        decimalPlaces: 0,
        color: (opacity = 1) => Colors.primary,
        labelColor: (opacity = 1) => Colors.black,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: Colors.primary,
        },
        yAxisSuffix: 'M',
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.title}>Dashboard</Text>
                <View style={styles.placeholder} />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
            ) : (
                <View style={styles.dashboardContent}>
                    <Text style={styles.sectionTitle}>Doanh thu theo ngày (VND)</Text>
                    <View style={styles.chartContainer}>
                        <LineChart
                            data={dailyChartData}
                            width={screenWidth - 60}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            fromZero
                            verticalLabelRotation={-30}
                            withInnerLines={false}
                            decorator={() => {
                                return tooltipPos.visible ? (
                                    <View>
                                        <Text
                                            style={{
                                                position: 'absolute',
                                                top: tooltipPos.y - 30,
                                                left: tooltipPos.x - 15,
                                                backgroundColor: Colors.white,
                                                padding: 5,
                                                borderRadius: 5,
                                                elevation: 5,
                                                color: Colors.primary
                                            }}
                                        >
                                            {tooltipPos.value}M
                                        </Text>
                                    </View>
                                ) : null;
                            }}
                            onDataPointClick={(data) => {
                                let isSamePoint = tooltipPos.x === data.x && tooltipPos.y === data.y;

                                isSamePoint
                                    ? setTooltipPos((prevState) => ({
                                        ...prevState,
                                        value: data.value,
                                        visible: !prevState.visible,
                                    }))
                                    : setTooltipPos({ x: data.x, value: data.value, y: data.y, visible: true });
                            }}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Doanh thu theo tháng (VND)</Text>
                    <View style={styles.chartContainer}>
                        <BarChart
                            data={monthlyChartData}
                            width={screenWidth - 60}
                            height={240}
                            chartConfig={chartConfig}
                            fromZero
                            yAxisInterval={1}
                            showBarTops={true}
                            withInnerLines={false}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 20,
        backgroundColor: Colors.primary,
        paddingTop: 40,
        paddingBottom: 20,
        marginBottom: 20
    },
    dashboardContent: {
        padding: 20,
        paddingTop: 10
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 45
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.white,
        textAlign: 'center',
    },
    placeholder: {
        width: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.black,
        marginVertical: 10,
        textAlign: 'left',
    },
    chartContainer: {
        backgroundColor: Colors.activePrimary,
        borderRadius: 16,
        padding: 10,
        marginBottom: 20,
        elevation: 5,
    },
});
