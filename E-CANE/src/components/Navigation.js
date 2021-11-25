import React,  { Component } from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import  LoginScreen from './LoginScreen';
import  NotificationScreen from './NotificationScreen';


import  OTPScreen from './OTPScreen';

import  SplashScreen from './SplashScreen';

import  TokenDetails from './supervisor/TokenDetails';
import  Scanner from './supervisor/Scanner';
import  LandingSurveyScreen from './survey/LandingSurveyScreen';
import  SurveyScreen from './survey/SurveyScreen';
import  AdminScreen from './management/AdminScreen';
import  SurveyorStats from './management/Statistics/SurveyorStats';
import  IndentingStats from './management/Statistics/IndentingStats';
import  WeighmentStats from './management/Statistics/WeighmentStats';
import  PaymentStats from './management/Statistics/PaymentStats';


import  FieldMeasurementScreen from './survey/FieldMeasurementScreen';
import  GeoCapturingScreen from './survey/GeoCapturingScreen';
import  FarmerMainScreen from './farmer/FarmerMainScreen';
import  KisanCodeScreen from './farmer/KisanCodeScreen';
import  WeightDetailsScreen from './farmer/WeightDetailsScreen';
import  FarmerDetails from './farmer/FarmerDetailsScreen';
import  TareDetailsScreen from './farmer/TareDetailsScreen';
import  LastTokenDetails from './reports/LastTokenDetails';

import  EDPScreen from './edp/EDPScreen';
import  SuperAdmin from './SuperAdmin';

import  ReportsScreen from './reports/ReportsScreen';

import  CameraScreen from './CameraScreen';

import AddFarmer from './add_farmer/AddFarmer'


const  MainNavigator = createStackNavigator(
  { 
  	SplashScreen:{
	  screen:SplashScreen  
	},

    FieldMeasurementScreen:{
	  screen:FieldMeasurementScreen  
	}, 
    LandingSurveyScreen:{
	  screen:LandingSurveyScreen  
	},
	FarmerMainScreen:{
	  screen:FarmerMainScreen  
	},
    GeoCapturingScreen:{
	  screen:GeoCapturingScreen  
	},

	SurveyScreen:{
	  screen:SurveyScreen  
	},
  
    LoginScreen:{
	  screen:LoginScreen,
	   navigationOptions: {
	     gesturesEnabled: false,
	  } 
	},

	 OTPScreen:{
	  screen:OTPScreen,
	   navigationOptions: {
	     gesturesEnabled: false,
	  }  
	},

    TokenDetails:{
	  screen:TokenDetails  
	},
	Scanner:{
	  screen:Scanner  
	},
    
    AdminScreen:{
	  screen:AdminScreen,
	   navigationOptions: {
	     gesturesEnabled: false,
	  }  
	},
	SurveyorStats:{
	  screen:SurveyorStats  
	},
	IndentingStats:{
	  screen:IndentingStats  
	},
	WeighmentStats:{
	  screen:WeighmentStats  
	},
	PaymentStats:{
	  screen:PaymentStats  
	},

	KisanCodeScreen:{
	  screen:KisanCodeScreen  
	},
	WeightDetailsScreen:{
	  screen:WeightDetailsScreen  
	},
	FarmerDetails:{
	  screen:FarmerDetails  
	},
	TareDetailsScreen:{
	  screen:TareDetailsScreen  
	},
	EDPScreen:{
	  screen:EDPScreen  
	},
	SuperAdmin:{
	  screen:SuperAdmin
	},
	ReportsScreen:{
	  screen:ReportsScreen
	},
	CameraScreen:{
	  screen:CameraScreen
	},
    NotificationScreen:{
	  screen:NotificationScreen
	},
	LastTokenDetails:{
	  screen:LastTokenDetails
	},

	AddFarmer:{
		screen:AddFarmer
	  },
			 		 
 });

const RootStack = createAppContainer(MainNavigator);

export default RootStack;
     

