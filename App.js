import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { FavoriteProvider } from './context/FavoriteContext';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from './components/screens/Home';
import Favorite from './components/screens/Favorite';
import ProductDetail from './components/screens/ProductDetail';
import ProductScreen from './components/screens/ProductScreen';
import Dashboard from './components/screens/Dashboard';
import { Colors } from './contrast/Colors';
import { useFonts } from 'expo-font';
import Profile from './components/screens/Profile';
import ProductCart from './components/screens/ProductCart';
import { CartProvider } from './context/CartContext';
import WelcomeScreen from './components/screens/WelcomeScreen';
import SignIn from './components/screens/SignIn';
import SignUp from './components/screens/SignUp';
import ProductPayment from './components/screens/ProductPayment';
import OrderHistory from './components/screens/OrderHistory';
import PaymentSuccess from './components/screens/PaymentSuccess';
import OrderManagement from './components/screens/OrderManagement';
import KoiManagement from './components/screens/KoiManagement';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Home} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const savedRole = await AsyncStorage.getItem('role');
      setRole(savedRole);
      setLoading(false);
    };
    fetchRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorite"
        component={Favorite}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="heart" size={28} color={color} />
          ),
        }}
      />
      {role === "STAFF" && (
        <>
          <Tab.Screen
            name="KoiManagement"
            component={KoiManagement}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="fish" size={28} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="OrderManagement"
            component={OrderManagement}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="truck-delivery" size={24} color={color} />
              ),
            }}
          />
        </>
      )}
      {role === "ADMIN" && (
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({ color }) => (
              <Feather name="bar-chart-2" size={28} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={28} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="Tabs" component={HomeStack} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="ProductScreen" component={ProductScreen} />
      <Stack.Screen name="ProductCart" component={ProductCart} />
      <Stack.Screen name="ProductPayment" component={ProductPayment} />
      <Stack.Screen name="OrderHistory" component={OrderHistory} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PoppinsExtraLight: require('./assets/fonts/Poppins-ExtraLight.ttf'),
    PoppinsLight: require('./assets/fonts/Poppins-Light.ttf'),
    PoppinsLightItalic: require('./assets/fonts/Poppins-LightItalic.ttf'),
    PoppinsMedium: require('./assets/fonts/Poppins-Medium.ttf'),
    PoppinsMediumItalic: require('./assets/fonts/Poppins-MediumItalic.ttf'),
    PoppinsRegular: require('./assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('./assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsSemiBoldItalic: require('./assets/fonts/Poppins-SemiBoldItalic.ttf'),
    PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
    PoppinsBoldItalic: require('./assets/fonts/Poppins-BoldItalic.ttf'),
    PoppinsExtraBold: require('./assets/fonts/Poppins-ExtraBold.ttf'),
    PoppinsExtraBoldItalic: require('./assets/fonts/Poppins-ExtraBoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FavoriteProvider>
        <CartProvider>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </CartProvider>
      </FavoriteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    marginBottom: 15,
    height: 60,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
});
