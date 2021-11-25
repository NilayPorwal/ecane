import React, { Component } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, Alert, View, Text, TextInput, TouchableOpacity, ActivityIndicator, CheckBox,
        Button, AsyncStorage, Image, ImageBackground, BackHandler, ToastAndroid, PermissionsAndroid,Keyboard, KeyboardAvoidingView, Dimensions} from 'react-native';
import { Icon } from 'native-base';
import APIManager from './APIManager';
import { encrypt, decrypt1 } from "./AESEncryption"
import axios from 'axios';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
const IMEI = require('react-native-imei');
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';

const {height, width} = Dimensions.get('window');

export default class LoginScreen extends Component {

   constructor(props) {
    super(props);
   
    this.state = {
     isLoading:false,
     username:null,
     password:null,
     ipAddress:"skydev.eastus2.cloudapp.azure.com:8080",
    // ipAddress:"192.168.1.39:8080",
     //ipAddress:"192.168.0.108:8080",
    // ipAddress:"112.133.247.24",
    // ipAddress:"192.168.1.140:9080",
    // ipAddress:"erp.mspil.in:8080",
    //ipAddress:null,
     mobileNumber:null,
     otpData:{},
     deviceInfo:{},
     selectedNet:0,
     secureTextEntry:true
    }; 
    global.LoginScreen = this;   
  }
    static navigationOptions =  ({ navigation }) => { return {
 
    header:null  
   } 
  };

 
  async componentDidMount(){
      //  alert(DeviceInfo.getUniqueId())
     if(APIManager.isDev != true){
       await APIManager.setHost()
        this.retriveData()
      }
     BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);
     this.requestPermission()
     this.getDeviceInfo()
   }
   

  handleAndroidBackButton() {
     BackHandler.exitApp();    
    }      
        
    
  componentWillUnmount() {
     BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);

  }

   retriveData(){
      APIManager.getValueForKey('ipAddress', (data)=>{
       if(data != null ){ 
        this.setState({ipAddress:data})
      }
      },(error)=>{
           console.log("Ip Address " + JSON.stringify(error));
      })

    //  APIManager.getValueForKey('networkType', (data)=>{
    //  if(data != null ){ 
    //   this.setState({selectedNet:data})
    //    //this.getFarmerTareDetails();
    // }
    // },(error)=>{
    //      console.log("Network Type " + JSON.stringify(error));
    // })
  }


  async requestPermission() {
  try {
    const granted = await PermissionsAndroid.requestMultiple(
      [PermissionsAndroid.PERMISSIONS.CAMERA,
       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
       PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ] 
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}
   

   async getDeviceInfo(){
    //const imei = await (Platform.OS == "android")?IMEI.getImei():null;
     let imei;
    // IMEI.getImei()
    // .then((res)=>{
    //     imei = res;
    // })
    // .catch((error)=>{
    //      imei = null
    // })
    const deviceID = await DeviceInfo.getUniqueId();
    const deviceBrand = await DeviceInfo.getBrand();
    const fcmToken = await AsyncStorage.getItem('fcmToken');
    const deviceType = (Platform.OS == "ios")?"IOS":"Android";
    // const deviceUniqueId = await getUniqueId;
    // const deviceMacAddress = await getMacAddress;

    const diviceInfo = {deviceID: deviceID, deviceBrand: deviceBrand, fcmToken:fcmToken, deviceType:deviceType}

    console.log(JSON.stringify(diviceInfo))
    this.setState({deviceInfo:{imei:imei, deviceID: deviceID, deviceBrand: deviceBrand, fcmToken:fcmToken, deviceType:deviceType}, fcmToken})

  } 

async updateDeviceId(){
    Keyboard.dismiss();
    if(APIManager.isDev == true){
       await  APIManager.setValueForKey('ipAddress', this.state.ipAddress);
       return  this.onLogin()
    }
    const deviceID = await DeviceInfo.getUniqueId();

    const data = {    
        "pUsername": this.state.username,
        "pDeviceInfo":deviceID,
        "pDeviceOsType":(Platform.OS == "ios")?"I":"A"
      }
  this.setState({isLoading:true})
    setTimeout(()=>{
      if(this.state.isLoading==true){
       Alert.alert("Login Failed", "Please try again");
       this.setState({isLoading:false})
     }
    }, 10000)

  console.log(JSON.stringify(data))
   APIManager.updateDeviceId(data, (response)=>{
      if(response.data.status == "SUCCESS"){
          response.data.data = JSON.parse(decrypt1(response.data.data.content));
          console.log("Update Device ID:" + JSON.stringify(response.data));
          if(response.data.data[0].serverResponseId == 200){
            this.onLogin()
          }else{
            this.setState({isLoading:false})
            Alert.alert("Log In Failure", JSON.stringify(response.data.data[0].serverResponseMsg))

          }
         }
      }, (error)=>{
         this.setState({isLoading:false})
        // Alert.alert("Log In Failure", JSON.stringify(error))
        console.log("Update Device Id falure", JSON.stringify(error));  
      })
} 
 
 onLogin(){
    Keyboard.dismiss();
  this.setState({isLoading:true})
  const {username, password, ipAddress} = this.state
  if(this.state.username != null && this.state.password != null){
      APIManager.locationEnabler((res)=>{
  
    APIManager.onLogin(username, password, (response)=>{
     // alert(JSON.stringify(response))
      if(response.valid === false){
          this.setState({isLoading:false})
          Alert.alert("Login Failed", "Invalid Username or Password")
      }else{
        //const responseJson = JSON.parse(decrypt1(response.data.data.content));
        //console.log("Log IN :" + JSON.stringify(responseJson));
       // APIManager.setValueForKey('ipAddress', ipAddress);
       // APIManager.setValueForKey('networkType', this.state.selectedNet);
        this.insertLog(response)

     } 
    }, (error)=>{
       this.setState({isLoading:false})
      //Alert.alert("Login Failed " + JSON.stringify(error.message));
      console.log(JSON.stringify(error))
    })
      }, (error)=>{
      this.setState({isLoading:false})
      console.log(JSON.stringify(error));  
    })  
  }else{
    Alert.alert("Login Failed", "Invalid Username or Password")
  }


}


insertLog(userData){
  //APIManager.getLocation((location)=>{
    const data = {    
        "pUserLogUserName": this.state.username,
        "pUserLogPassword":null,
        "pUserLogCounterKey":null,
        "pUserLogDevice": "mobile",
        "pUserLogDeviceId":this.state.deviceInfo,
        "pUserLogLoginLocation":"",
        "puserloghashkey":"",
        "pUserLogIsSuccess":1
      }
  console.log(JSON.stringify(data))
  APIManager.insertLog(userData.ssoId, userData.apiSeceretKey, data, (response)=>{
    this.setState({isLoading:false})
        if(response.data.status == "SUCCESS"){
            response.data.data = JSON.parse(decrypt1(response.data.data.content));
            console.log("Insert Log:" + JSON.stringify(response.data));
            APIManager.setValueForKey('logData', response.data.data)
            APIManager.setValueForKey('userData', userData)
            this.setState({isLoading:false, username:null, password:null})


           if(userData.roleName == "MANAGEMENT"){
                this.redirectTo("AdminScreen")
         
           }
           else if(userData.roleName == "SUPER_ADMIN"){
                this.redirectTo("SuperAdmin")
         
           }
           else if(userData.roleName == "SURVEYOR" || userData.roleName == "SUPERVISOR"){
                 this.redirectTo("LandingSurveyScreen")

           }
           else if(userData.roleName == "FARMER"){
                  this.redirectTo("KisanCodeScreen")
           }
           else if(userData.roleName == "REPORT_VIEWER"){
                  this.redirectTo("ReportsScreen")
           }           
           else if(userData.roleName == "CANEMANAGER" || userData.roleName == "CANE_MANAGER" || userData.roleName == "CANE-MANAGER"){
                 this.redirectTo("TokenDetails")

           }
           else if(userData.roleName == "EDPMANAGER" || userData.roleName == "EDP-MANAGER" || userData.roleName == "EDP_MANAGER"){
                 this.redirectTo("SuperAdmin")
           }
           else if(userData.roleName == "GENERAL_MANAGER"){
              this.redirectTo("SuperAdmin")

            }
           else {
             Alert.alert("Log In failed", "User does not exist")
           }
          }
        else{
           Alert.alert("Log failure", response.data.message)
             
          }   
        }, (error)=>{
           this.setState({isLoading:false})
            //Alert.alert("Login Failed", "Please try again");
            console.log("Log failure", JSON.stringify(error))
            Alert.alert("Log In failed", "Please try again")

        })
    // }, (error)=>{
    //        console.log("Unable to fetch location", JSON.stringify(error))
    //       this.setState({isLoading:false})
    // })
} 


  redirectTo(screen){
         const screenType =  {
                  "screenType": screen,
                }

          APIManager.setValueForKey('screenType', screenType) 
          this.props.navigation.push(screen)
  }



 getIpAddress(value){
   this.setState({selectedNet:value})
    APIManager.getIpAddress((response)=>{
    
     if(value == 1){
       if(response.data.sky_MSPIL_ERP_API_HOST !== null){
          const ip = response.data.sky_MSPIL_ERP_API_HOST
          this.setState({ipAddress:ip})
          APIManager.setValueForKey('ipAddress', ip);
          APIManager.setValueForKey('networkType', "1");
       } 

     }else if(value == 0){
       if(response.data.sky_MSPIL_ERP_API_HOST_LAN !== null){
          const ip = response.data.sky_MSPIL_ERP_API_HOST_LAN
          this.setState({ipAddress:ip})
          APIManager.setValueForKey('ipAddress', response.data.sky_MSPIL_ERP_API_HOST_LAN);
          APIManager.setValueForKey('networkType', "0");
     }

    }

       //alert(JSON.stringify(response))
    }, (error)=>{
       console.log(JSON.stringify(error))

     })
  
}

   
  
  render() {            
    return (

   <ImageBackground source={require('../assets/Splash.png')} style={{flex:1}}>
    <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
     <KeyboardAvoidingView behavior="padding">
     <View style={{alignItems:"center", marginTop:"8%"}}> 
        <Image
            style={{width: width*0.5, height: height*0.3}}
            resizeMode="contain"
            source={require('../assets/ic_launcher.png')}
          />  
       <View style={{width:"80%"}}> 
        <Text style={{fontSize:18, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center"}}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text>  
       </View> 
      </View>     
     <View style={{flex:1, marginTop:"10%"}}> 

     
     {/* (APIManager.isDev == true)?
     <View style={styles.textView}>
        <TextInput 
             style={{width:"85%", fontSize:18}}
             onChangeText={(ipAddress) => this.setState({ipAddress})}
             value={this.state.ipAddress}
             returnKeyType="next"    
             placeholder="IP Address or Domain Name"  
             //underlineColorAndroid='#000000'
         />  
      </View>:null   */}
   

      <View style={[styles.textView, {marginTop:Platform.OS === 'ios' ? 10 : 0}]}>
         <Icon
          name='user'       
          color='#000000'
          type="AntDesign"
          style={{fontSize:20}} />
        <TextInput
             style={{width:"85%", fontSize:18}}
             onChangeText={(username) => this.setState({username})}
             value={this.state.username}
             returnKeyType="next"    
             placeholder="Username"
             autoFocus
             // keyboardType='numeric'
             //underlineColorAndroid='#000000'
          
         />
      </View> 

        <View style={[styles.textView, {marginTop:Platform.OS === 'ios' ? 10 : 0}]}>
         <Icon
          name='lock'       
          color='#000000'
          type="AntDesign"
          style={{fontSize:20}} />
        <TextInput
             style={{width:"85%", fontSize:18}}
             onChangeText={(password) => this.setState({password})}
             value={this.state.password}
             returnKeyType="next"    
             placeholder="Password"
             secureTextEntry={this.state.secureTextEntry}
             //underlineColorAndroid='#000000'
          
         />

        <TouchableOpacity style={{position:"absolute", right:10}} onPress={()=>this.setState({secureTextEntry:!this.state.secureTextEntry})}>
           <Icon type="FontAwesome" name={(this.state.secureTextEntry)?'eye':'eye-slash'} style={{fontSize:20}} color='black'  />
        </TouchableOpacity>
      </View>

     
 {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" style={{marginTop:10}}/>:
  <View style={{alignItems:"center", marginTop:15}}>
      <View style={{width:"85%",}}>
      
       <TouchableOpacity onPress={()=>this.onLogin()} style={styles.buttonStyle}>
        <Text style={{color:"#ffffff", fontSize:width*0.04}}>Log In</Text>
       </TouchableOpacity>   
       </View> 
      
      {
      // <Text style={{color:"#000000", fontSize:15, paddingTop:10}}>Connect Via</Text>
      // <RadioGroup
      //       size={24} 
      //       thickness={2}
      //       color='#232f3e'
      //       style={{flexDirection:"row"}}
      //       selectedIndex={this.state.selectedNet}
      //       onSelect = {(index, value) => this.getIpAddress(value)}
      //      >
      //       <RadioButton value={'0'} >
      //         <Text>Local(LAN)</Text> 
      //       </RadioButton>
     
      //       <RadioButton value={'1'}>
      //         <Text>Internet(WAN)</Text>
      //       </RadioButton>
               
      //   </RadioGroup> 
      }
  
    </View> } 
    </View>

           <View style={{alignItems:"center", marginTop:height*0.1}}>
                <Image
                  style={{width:width*0.5, height:height*0.1}}
                  resizeMode="contain"
                  source={require('./../assets/logo.png')}
                />
             </View> 
    </KeyboardAvoidingView>
    </ScrollView>
    </ImageBackground>
    )   
  }   
}    

const styles = StyleSheet.create({
  textView :{
    alignItems:"center", flexDirection:"row", borderBottomWidth:1, marginHorizontal:25, padding:Platform.OS === 'ios' ? 10 : 0,
  },
  buttonStyle:{
    backgroundColor:"#8db301", alignItems:"center", paddingVertical:10, elevation:8, borderRadius:3, marginTop:10
  }

});