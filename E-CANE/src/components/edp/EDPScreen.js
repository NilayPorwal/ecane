import React, { Component } from 'react';
import {Platform, Text, View, ImageBackground, Image, ScrollView, TouchableOpacity,Alert, Keyboard,Dimensions,
         StyleSheet, Modal, TouchableHighlight, ActivityIndicator, Button, TextInput, BackHandler , AsyncStorage, SafeAreaView} from 'react-native';
import I18n, { getLanguages } from 'react-native-i18n';
import { Icon, Picker, CheckBox } from 'native-base';
import APIManager from './../APIManager';
import { encrypt, decrypt } from "./../AESEncryption"
import base64 from 'react-native-base64'
import axios from 'axios';
var dateFormat = require('dateformat');
import Storage from 'react-native-storage';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
const IMEI = require('react-native-imei');
import DeviceInfo,{ getUniqueId, getMacAddress} from 'react-native-device-info';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import ImagePicker from 'react-native-image-picker';


const {height, width} = Dimensions.get('window');
let deviceInfo = {}

export default class EDPScreen extends Component {
    constructor(props) {
        super(props);
    this.state = {
               modalVisible: false,
               modalVisible1: false,
               modalVisible2: false,
               modalVisible3: false,
               modalVisible4: false,
               modalVisible5: false,
               modalVisible6: false,
               modalVisible7: false,
               modalVisible8: false,
               modalVisible9: false,
               codeNumber:null,
               token:null,
               userData:{},
               tokenData:[],
               canUpdate:false,
               rfid:null,
               reason:null,
               mode:0,
               transport:0,
               harvester:null,
               farmerCode:null,
               modeList:[],
               transporterList:[],
               harvesterList:[],
               orderBy:0,
               authPersonList:[],
               authPersonId:0,
               netModal:false,
               selectedNet:0,
               image1:{},
               image2:{},
               imageData:[],
               checked:false,
               validRFID:null
            }
            global.EDPScreen = this;
        }


            toggleModal(visible)  {
               this.setState({ modalVisible: visible });
            }
            toggleModal1(visible)  {
                this.setState({ modalVisible1: visible });
             }
             toggleModal2(visible)  {
                this.setState({ modalVisible2: visible });
             }
             toggleModal3(visible)  {
                this.setState({ modalVisible3: visible });
             }
             toggleModal4(visible)  {
                this.setState({ modalVisible4: visible });
             }
             toggleModal5(visible)  {
                this.setState({ modalVisible5: visible });
             }
             toggleModal6(visible)  {
                this.setState({ modalVisible6: visible });
             }
            toggleModal7(visible)  {
                this.setState({ modalVisible7: visible });
             }
            toggleModal8(visible)  {
                this.setState({ modalVisible8: visible });
             }
            toggleModal9(visible)  {
                this.setState({ modalVisible9: visible });
             }  



   async componentDidMount() {
     if(APIManager.isDev != true){ 
       await APIManager.setHost()
      }
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);
        this.retriveData();
        this.getDeviceInfo();
        this.getModeList()
        this.getTranportList()
        this.getharvesterList()
        this.getAuthPersonList()

      }
    
    handleAndroidBackButton() {
        if(global.EDPScreen.state.userData.roleName == "SUPER_ADMIN" || global.EDPScreen.state.userData.roleName == "EDPMANAGER"){
          global.EDPScreen.props.navigation.goBack();
        }else{
            BackHandler.exitApp(); 
        }
         return true;
       }         
               
       
     componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
     }


        static navigationOptions = {
            header: null,        
        };

   async getDeviceInfo(){
    // const imei = await(Platform.OS == "android")?IMEI.getImei():null;
    // let imei;
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
    deviceInfo = {deviceID: deviceID, deviceBrand: deviceBrand, deviceType:deviceType, fcmToken:fcmToken}
    console.log(JSON.stringify(deviceInfo))
    //this.setState({deviceInfo:{imei:imei, deviceBrand: deviceBrand, deviceType:deviceType}})

  }       

  retriveData(){
    APIManager.getValueForKey('userData', (data)=>{
     if(data != null ){ 
      this.setState({userData:data})
       //this.getFarmerTareDetails();

    }
    },(error)=>{
         console.log("User Data " + JSON.stringify(error));
    })

  }

  getTokenDetailsToChange() { 
  this.setState({ tokenData:[], canUpdate:false})
  if(this.state.codeNumber == null){
    Alert.alert("Token Required")
  } else { 
    this.setState({isLoading: true, data:[]})
    const data = {
      "pSwtmTkSlipNo": this.state.codeNumber
    } 
   APIManager.getTokenDetailsToChange(data, (response)=>{
      console.log(JSON.stringify(response));   
       if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
           console.log("get token details to change :" + JSON.stringify(response.data));
           
           if(response.data.data[0].serverResponseId === 404){
              this.setState({isLoading:false})
               Alert.alert("Token not found")
             
           }else if(response.data.data[0].serverResponseId === 500){
              Alert.alert("Tare already done")
              this.setState({isLoading:false}) 
           }else{
              this.setState({isLoading:false, tokenData:response.data.data, canUpdate:true, checked:(response.data.data[0].BURNT_FLG == 0)?false:true})
           }

        } else {    
           console.log('error', response);  
           Alert.alert("Error", response.data.message)
           this.setState({isLoading:false})
        } 
   },(error)=>{
      this.setState({isLoading:false})
      console.log('Token details error', JSON.stringify(error));
    })
  }
 } 


  getRFIDDetails() {
    this.setState({ tokenData:[], canUpdate:false})
    if(this.state.codeNumber == null){
      Alert.alert("RFID Required")
    } else { 
      this.setState({isLoading: true, data:[]})
      const data = {
        "pRfidNo": this.state.codeNumber
      } 
     APIManager.getRFIDDetails(data, (response)=>{
        console.log(JSON.stringify(response));
         if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
             console.log("get RFID details :" + JSON.stringify(response.data));
             this.setState({isLoading:false})
             this.setState({canUpdate:true, checked:(response.data.data[0].RfidStatus == 1)?true:false, validRFID:true})

          } else {    
             console.log('error', response);  
             //Alert.alert("Error", response.data.message)
             this.setState({isLoading:false, validRFID:false})
          } 
     },(error)=>{
        this.setState({isLoading:false})
        console.log('Token details error', JSON.stringify(error));
      })
    }
 } 



  getModeList(){

   APIManager.getModeList((response)=>{
      if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
          console.log("Mode List :" + JSON.stringify(response.data));
         
          this.setState({modeList: response.data.data })
   

        } else {
          console.log('Mode list error', JSON.stringify(response));

        }
    }, (error)=>{
      console.log('Mode list error', JSON.stringify(response));
    })
  }

  getTranportList(){

   APIManager.getTranportList((response)=>{   
      if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
          console.log("Transporter List :" + JSON.stringify(response.data));
         
          this.setState({transporterList: response.data.data })
   
        } else {
          console.log('Transporter list error', JSON.stringify(response));

        }
    }, (error)=>{
      console.log('Transporter list error', JSON.stringify(response));
    })
  };

  getharvesterList(){
    
   APIManager.getharvesterList((response)=>{   
      if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
          console.log("Harvester List :" + JSON.stringify(response.data));
         
          this.setState({harvesterList: response.data.data })
   

        } else {
          console.log('Harvester list error', JSON.stringify(response));

        }
    }, (error)=>{
      console.log('Harvester list error', JSON.stringify(response));
    })
  };

    getAuthPersonList(){

   APIManager.getAuthPersonList((response)=>{ 
      //console.log('Auth Persons list', JSON.stringify(response));
      if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
           console.log("Auth Persons List :" + JSON.stringify(response.data));
          const data = JSON.parse(base64.decode(response.data.data[0].config_value))
          console.log("Auth Persons List1 :" + JSON.stringify(data));
         
          this.setState({authPersonList:data })
   

        } else {
          console.log('Auth Persons list error', JSON.stringify(response));

        }
    }, (error)=>{
      console.log('Auth Persons list error', JSON.stringify(response));
    })
  }


 updateRFID(){
      Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.rfid == null || this.state.reason == null || this.state.rfid.trim() == "" || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'New RFID' and 'Reason to change' is required")
   }else if(this.state.rfid != null && this.state.rfid.length < 5){
     return Alert.alert("Wait !!", "Invalid RFID")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
    this.setState({isLoading: true})
   
     APIManager.getLocation((location)=>{
      //deviceInfo.push(location) 
      deviceInfo.location = location
      
      const data = {   
        "pTokenNo":this.state.codeNumber,  
        "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
        "pOldRfId":this.state.tokenData[0].RF_NO,   
        "pNewRfId": this.state.rfid, 
        "pReasonToUpdate":this.state.reason,
        "pUpdateUserId":this.state.userData.userId,
        "pDeviceInfo":deviceInfo
      }  
       
      console.log("Device Info", JSON.stringify(data))

       APIManager.updateRFID(data, (response)=>{
         console.log(JSON.stringify(response));

        if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
            console.log("on update Details :" + JSON.stringify(response.data));
           
               if(response.data.data[0].serverResponseType == 200){
                   this.uploadFile(response.data.data[0])                    
               }else{
                  Alert.alert("Error", response.data.data[0].serverResponseMsg)
                  this.setState({isLoading:false}) 
               }
            //result.success = true;
          } else {                  
             console.log('error', response);   
             this.setState({isLoading:false})
             Alert.alert("Failed to update RFID", response.data.message)
           //  alert("Incorrect Farmer Code")
        }
      }, (error)=>{
            this.setState({isLoading:false})
            Alert.alert(JSON.stringify(error));
    
      })
     }, (error)=>{
           this.setState({isLoading:false})
            console.log(JSON.stringify(error));
            Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))
            //Alert.alert("Location Error", "Please turn on your mobile GPS location")               
     })  
            
  } 

  

  updateMode(){
       Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.mode == null || this.state.reason == null || this.state.mode == 0 || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'New Mode' and 'Reason to change' is required")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
    this.setState({isLoading: true})
     
       APIManager.getLocation((location)=>{
        //deviceInfo.push(location) 
        deviceInfo.location = location
        
        const data = {   
          "pTokenNo":this.state.codeNumber,  
          "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
          "pOldModeAiId":this.state.tokenData[0].MOD_ID,   
          "pNewModeAiId": this.state.mode,
          "pReasonToUpdate":this.state.reason,
          "pUpdateUserId":this.state.userData.userId,
          "pDeviceInfo":deviceInfo
        }
         
        console.log("Device Info", JSON.stringify(data))

         APIManager.updateMode(data, (response)=>{
          if (response.data.status === "SUCCESS") {
              response.data.data = JSON.parse(decrypt(response.data.data.content));
              console.log("on update Details :" + JSON.stringify(response.data));           
                 
                 if(response.data.data[0].serverResponseType == 200){
                     this.uploadFile(response.data.data[0])                    
                 }else{
                    Alert.alert("Error", response.data.data[0].serverResponseMsg)
                    this.setState({isLoading:false}) 
                 }
              //result.success = true;
            } else {                  
               console.log('error', response);   
               this.setState({isLoading:false})
               Alert.alert("Failed to update mode", response.data.message)
             //  alert("Incorrect Farmer Code")
          }
        }, (error)=>{
              this.setState({isLoading:false})
              Alert.alert(JSON.stringify(error));
      
        })
       }, (error)=>{
            this.setState({isLoading:false})
            console.log(JSON.stringify(error));
            Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))
            //Alert.alert("Location Error", "Please turn on your mobile GPS location")                   
       })   
             
  } 

  updateFarmer(){
       Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.farmerCode == null || this.state.reason == null || this.state.farmerCode.trim() == 0 || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'New Farmer Code' and 'Reason to change' is required")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
   APIManager.locationEnabler((res)=>{

        this.setState({isLoading: true})
       
         APIManager.getLocation((location)=>{
          //deviceInfo.push(location) 
          deviceInfo.location = location
          
          const data = {   
            "pTokenNo":this.state.codeNumber,  
            "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
            "pOldFarmerCode":this.state.tokenData[0].FARMER_CODE,   
            "pNewFarmerCode": this.state.farmerCode,
            "pReasonToUpdate":this.state.reason,
            "pUpdateUserId":this.state.userData.userId,
            "pDeviceInfo":deviceInfo
          }
           
          console.log("Device Info", JSON.stringify(data))

           APIManager.updateFarmer(data, (response)=>{
             console.log(JSON.stringify(response));   
            if (response.data.status === "SUCCESS") {
                response.data.data = JSON.parse(decrypt(response.data.data.content));
               console.log("on update Details :" + JSON.stringify(response.data));

                 
                   if(response.data.data[0].serverResponseType == 200){
                       this.uploadFile(response.data.data[0])                    
                   }else{
                      Alert.alert("Error", response.data.data[0].serverResponseMsg)
                      this.setState({isLoading:false}) 
                   }
                //result.success = true;
              } else {                  
                 console.log('error', response);   
                 this.setState({isLoading:false})
                 Alert.alert("Failed to update farmer", response.data.message)
               //  alert("Incorrect Farmer Code")
            }
          }, (error)=>{
                this.setState({isLoading:false})
                Alert.alert(JSON.stringify(error));
        
          })
         }, (error)=>{
               this.setState({isLoading:false})
                console.log(JSON.stringify(error));
                Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

                //Alert.alert("Location Error", "Please turn on your mobile GPS location")
               
         })
        }, (error)=>{
                this.setState({isLoading:false})
                Alert.alert(JSON.stringify(error));
        
      })     
       
  } 

  updateHarvester(){
       Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.harvester == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'New Harvester' and 'Reason to change' is required")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
    this.setState({isLoading: true})
   
     APIManager.getCurrentLocation((location)=>{
      //deviceInfo.push(location) 
      deviceInfo.location = location
      
      const data = {   
        "pTokenNo":this.state.codeNumber,  
        "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
        "pOldHrCode":this.state.tokenData[0].HR_ID,   
        "pNewHrCode": this.state.harvester,
        "pReasonToUpdate":this.state.reason,
        "pUpdateUserId":this.state.userData.userId,
        "pDeviceInfo":deviceInfo
      }
       
      console.log("Device Info", JSON.stringify(data))

       APIManager.updateHarvester(data, (response)=>{
         console.log(JSON.stringify(response));   
        if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
            console.log("on update Details :" + JSON.stringify(response.data));

               if(response.data.data[0].serverResponseType == 200){
                   this.uploadFile(response.data.data[0])                    
               }else{
                  Alert.alert("Error", response.data.data[0].serverResponseMsg)
                  this.setState({isLoading:false}) 
               }
            //result.success = true;
          } else {                  
             console.log('error', response);   
             this.setState({isLoading:false})
             Alert.alert("Failed to update Harvester", response.data.message)
           //  alert("Incorrect Farmer Code")
        }
      }, (error)=>{
            this.setState({isLoading:false})
            Alert.alert(JSON.stringify(error));
    
      })
     }, (error)=>{
           this.setState({isLoading:false})
            console.log(JSON.stringify(error));
            Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

            //Alert.alert("Location Error", "Please turn on your mobile GPS location")
           
     })          
  } 

   updateTransporter(){
       Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.transport == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'New Transporter' and 'Reason to change' is required")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
    this.setState({isLoading: true})
   
     APIManager.getLocation((location)=>{
      //deviceInfo.push(location) 
      deviceInfo.location = location
      
      const data = {   
        "pTokenNo":this.state.codeNumber,  
        "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
        "pOldTrCode":this.state.tokenData[0].TR_ID,   
        "pNewTrCode": this.state.transport,
        "pReasonToUpdate":this.state.reason,
        "pUpdateUserId":this.state.userData.userId,
        "pDeviceInfo":deviceInfo
      }
       
      console.log("Device Info", JSON.stringify(data))

       APIManager.updateTransporter(data, (response)=>{
         console.log(JSON.stringify(response));   
        if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
            console.log("on update Details :" + JSON.stringify(response.data));

                if(response.data.data[0].serverResponseType == 200){
                     this.uploadFile(response.data.data[0])                    
                 }else{
                    Alert.alert("Error", response.data.data[0].serverResponseMsg)
                    this.setState({isLoading:false}) 
                 }
          } else {                  
             console.log('error', response);   
             this.setState({isLoading:false})
             Alert.alert("Failed to update Transporter", response.data.message)
           //  alert("Incorrect Farmer Code")
        }
      }, (error)=>{
            this.setState({isLoading:false})
            Alert.alert(JSON.stringify(error));
    
      })
     }, (error)=>{
           this.setState({isLoading:false})
            console.log(JSON.stringify(error));
            Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

            //Alert.alert("Location Error", "Please turn on your mobile GPS location")
           
     })
       
  }

 tokenLock(lockType){ 
     Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.authPersonId == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'Order By' and 'Reason' is required")
   }
  
      this.setState({isLoading: true})
     
       APIManager.getCurrentLocation((location)=>{
        //deviceInfo.push(location) 
        deviceInfo.location = location
        const orderBy = this.getOrderby()
        orderBy.reason = this.state.reason
        
        const data = {   
          "pTokenNo":this.state.codeNumber,  
          "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
          "pLockType":lockType,         
          "pReasonToUpdate":orderBy,
          "pOrderBy":  this.getOrderby(),
          "pUpdateUserId":this.state.userData.userId,
          "pDeviceInfo":deviceInfo
        }
         
        console.log("Device Info", JSON.stringify(data))

         APIManager.tokenLock(data, (response)=>{
           console.log(JSON.stringify(response));   
          if (response.data.status === "SUCCESS") {
              response.data.data = JSON.parse(decrypt(response.data.data.content));
              console.log("on token lock :" + JSON.stringify(response.data));

                 if(response.data.data[0].serverResponseId == 200){
                     this.setState({isLoading:false,  reason:null, canUpdate:false, authPersonId:0 })
                     Alert.alert("UPDATED", response.data.data[0].serverResponseMsg)
                     this.modalClose()
                   
                 }else {
                    Alert.alert("Error", response.data.data[0].serverResponseMsg)
                    this.setState({isLoading:false}) 
                 }
              //result.success = true;
            } else {                  
               console.log('error', response);   
               this.setState({isLoading:false})
               Alert.alert("Failed to lock token", response.data.message)
             //  alert("Incorrect Farmer Code")
          }
        }, (error)=>{
              this.setState({isLoading:false})
              Alert.alert(JSON.stringify(error));
      
        })
       }, (error)=>{
             this.setState({isLoading:false})
              console.log(JSON.stringify(error));
              Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

              //Alert.alert("Location Error", "Please turn on your mobile GPS location")
             
       })
              
  }


 bypassToken(){
     Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.authPersonId == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'Order By' and 'Reason' is required")
   }
  
      this.setState({isLoading: true})
     
       APIManager.getCurrentLocation((location)=>{
        //deviceInfo.push(location) 
        deviceInfo.location = location
        const orderBy = this.getOrderby()
        orderBy.reason = this.state.reason
        
        const data = {   
          "pTokenNo":this.state.codeNumber,  
          "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
          "pByPassType":"A",         
          "pReasonToUpdate":orderBy,
          "pOrderBy": this.getOrderby(),
          "pUpdateUserId":this.state.userData.userId,
          "pDeviceInfo":deviceInfo
        }
         
        console.log("Device Info", JSON.stringify(data))

         APIManager.bypassToken(data, (response)=>{
           console.log(JSON.stringify(response));   
          if (response.data.status === "SUCCESS") {
              response.data.data = JSON.parse(decrypt(response.data.data.content));
              console.log("on token lock :" + JSON.stringify(response.data));
                 if(response.data.data[0].serverResponseId == 200){
                     this.setState({isLoading:false,  reason:null, canUpdate:false, authPersonId:0 })
                     Alert.alert("UPDATED", response.data.data[0].serverResponseMsg)
                     this.modalClose()
                   
                 }else {
                    Alert.alert("Error", response.data.data[0].serverResponseMsg)
                    this.setState({isLoading:false}) 
                 }
            } else {                  
               console.log('error', response);   
               this.setState({isLoading:false})
               Alert.alert("Failed to lock token", response.data.message)
             //  alert("Incorrect Farmer Code")
          }
        }, (error)=>{
              this.setState({isLoading:false})
              Alert.alert(JSON.stringify(error));
      
        })
       }, (error)=>{
             this.setState({isLoading:false})
              console.log(JSON.stringify(error));
              Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

              //Alert.alert("Location Error", "Please turn on your mobile GPS location")
             
       })
     
  }

   updateBurntFlag(){
     Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid token number")
   }else if(this.state.authPersonId == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'Order By' and 'Reason' is required")
   }else if(this.state.imageData.length == 0){
     return Alert.alert("Wait !!", "Document is required")
   }
  
      this.setState({isLoading: true})
     
       APIManager.getCurrentLocation((location)=>{
        //deviceInfo.push(location) 
        deviceInfo.location = location
        const orderBy = this.getOrderby()
        orderBy.reason = this.state.reason
        
        const data = {   
          "pTokenNo":this.state.codeNumber,  
          "pTokenAiId": this.state.tokenData[0].TKN_AI_ID,    
          "pBurntCaneFlag":(this.state.checked)?"A":"D",
          "pOrderBy": this.getOrderby(),
          "pReasonToUpdate":orderBy,
          "pUpdateUserId":this.state.userData.userId,
          "pDeviceInfo":deviceInfo
        }
         
        console.log("Device Info", JSON.stringify(data))

         APIManager.updateBurntFlag(data, (response)=>{
           console.log(JSON.stringify(response));   
          if (response.data.status === "SUCCESS") {
              response.data.data = JSON.parse(decrypt(response.data.data.content));
              console.log("on Burn flag update :" + JSON.stringify(response.data));
                if(response.data.data[0].serverResponseType == 200){
                     this.uploadFile(response.data.data[0])                    
                 }else{
                    Alert.alert("Error", response.data.data[0].serverResponseMsg)
                    this.setState({isLoading:false}) 
                 }
            } else {                  
               console.log('error', response);   
               this.setState({isLoading:false})
               Alert.alert("Failed to update burnt flag", response.data.message)
             //  alert("Incorrect Farmer Code")
          }
        }, (error)=>{
              this.setState({isLoading:false})
              Alert.alert(JSON.stringify(error));
      
        })
       }, (error)=>{
             this.setState({isLoading:false})
              console.log(JSON.stringify(error));
              Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

              //Alert.alert("Location Error", "Please turn on your mobile GPS location")
             
       })
              
  }

  lockUnlockRFID(){
     Keyboard.dismiss();
   if(this.state.canUpdate == false){
     return Alert.alert("Wait !!", "Please provide a valid RFID number")
   }else if(this.state.authPersonId == 0 || this.state.reason == null || this.state.reason.trim() == ""){
     return Alert.alert("Wait !!", "'Order By' and 'Reason' is required")
   }
  
    this.setState({isLoading: true})
   
     APIManager.getCurrentLocation((location)=>{
      //deviceInfo.push(location) 
      deviceInfo.location = location
      const orderBy = this.getOrderby()
      orderBy.reason = this.state.reason
      const data = {   
        "pRfidNo":this.state.codeNumber,  
        "pstatus": (this.state.checked == true)?"1":"0",
        "pReasonToUpdate":orderBy,
        "pUpdateUserId":this.state.userData.userId,
        "pDeviceInfo":deviceInfo
      }
       
      console.log("Device Info", JSON.stringify(data))

       APIManager.lockUnlockRFID(data, (response)=>{
         console.log(JSON.stringify(response));   
        if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
            console.log("on lock/unlock RFID :" + JSON.stringify(response.data));
              if(response.data.data[0].serverResponseType == 200){
                      this.setState({isLoading:false, reason:null, canUpdate:false, checked:false})
                      Alert.alert("UPDATED", response.data.data[0].serverResponseMsg) 
                      this.modalClose()

               }else{
                  Alert.alert("Error", response.data.data[0].serverResponseMsg)
                  this.setState({isLoading:false}) 
               }
          } else {                  
             console.log('error', response);
             this.setState({isLoading:false})
             Alert.alert("Failed to lock RFID", response.data.message)
           //  alert("Incorrect Farmer Code")
        }
      }, (error)=>{
            this.setState({isLoading:false})
            Alert.alert(JSON.stringify(error));
    
      })
     }, (error)=>{
           this.setState({isLoading:false})
            console.log(JSON.stringify(error));
            Alert.alert(I18n.t("Unable to fetch location"), I18n.t("Please try again or turn on you mobile gps"))

            //Alert.alert("Location Error", "Please turn on your mobile GPS location")
           
     })
             
  }

  getOrderby(){
    //console.log(JSON.stringify(this.state.authPersonList))
    for(let i = 0; i<this.state.authPersonList.length; i++){
      console.log(this.state.authPersonId == this.state.authPersonList[i].id)
      if(this.state.authPersonId == this.state.authPersonList[i].id){
        const data = {"personName": this.state.authPersonList[i].person_name, "mobile_no":this.state.authPersonList[i].mobile_no}
         return data
      }
    }
  }


  
  _handleCameraButtonPress(value) { 

     var options = {
      title: 'Select',
      quality: 0.3,
      storageOptions: {
        path: 'images'
      }    
    };
    ImagePicker.launchCamera(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
              
      else {  
       // let source =  response.uri   
       // You can also display the image using data:
       //let source = 'data:image/jpeg;base64,' + response.data ;
       console.log(JSON.stringify(response))
      if(value == 0){ 
          this.setState({
            image1:{uri: response.uri, name: response.fileName, type: response.type, base64:response.data },
            imageData:[...this.state.imageData, {"file": response.data,"fileExt":"jpeg"}]
          }); 
        }
      else if(value == 1){
        this.setState({
            image2:{uri: response.uri, name: response.fileName, type: response.type, base64:response.data },
            imageData:[...this.state.imageData, {"file": response.data,"fileExt":"jpeg"}]
          });
        }  
      }
    });    
   }

  uploadFile(res){

      APIManager.uploadFile(this.state.imageData, res.serverResponseId, (response)=>{
          this.setState({isLoading:false, reason:null, canUpdate:false,mode:0, farmerCode:null, transport:0, image1:{}, image2:{}, 
                         imageData:[],rfid:null, harvester:0, checked:false,  tokenData:[]})
          console.log(JSON.stringify(response));
           Alert.alert("UPDATED", res.serverResponseMsg) 
           this.modalClose()
            
       },(error)=>{
          this.setState({isLoading:false}) 
          console.log(JSON.stringify(error));
        
      })
  } 

  modalClose(){
    this.setState({modalVisible:false, modalVisible1:false, modalVisible2:false, modalVisible3:false, modalVisible4:false,modalVisible5:false,
                   modalVisible6:false, modalVisible7:false, modalVisible8:false,  modalVisible9:false, codeNumber:null, tokenData:[], sLoading:false,
                   mode:0, transport:0, authPersonId:0, reason:null, canUpdate:false, image1:{}, image2:{}, imageData:[], validRFID:null, checked:false, 
                   farmerCode:null})
  }

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

   onLogOut(){
    Alert.alert(
      "Logout Confirmation",
      'Do you want to Logout ?',      
      [
        { 
          text:  "No",
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: "Yes", onPress: () => this.logOut()},
      ],
      {cancelable: false},
    );

 }

 logOut(){
  this.hideMenu();

  APIManager.logOut((response)=>{
    if(response.status == "SUCCESS"){
     }
    else{
        Alert.alert("Logout Failed", response.message)
  
     } 
  },(error)=>{
       console.log("Logout Error " + JSON.stringify(error));

  })
     APIManager.removeValueForKey()
   this.setState({ userData:{}})
   this.props.navigation.navigate("LoginScreen")
  
} 

switchNet(){
   this.hideMenu();
    APIManager.getValueForKey('networkType', (data)=>{
     if(data != null ){ 
      this.setState({selectedNet:data, netModal:!this.state.netModal})
       //this.getFarmerTareDetails();
    }
    },(error)=>{
         this.setState({netModal:!this.state.netModal})
         console.log("Network Type " + JSON.stringify(error));
    })
 } 

 getIpAddress(value){
    APIManager.getIpAddress((response)=>{
     if(value == 1){
       if(response.data.sky_MSPIL_ERP_API_HOST !== null){
          
          APIManager.setValueForKey('ipAddress', response.data.sky_MSPIL_ERP_API_HOST);
          APIManager.setValueForKey('networkType', "1");
          this.setState({netModal:!this.state.netModal, selectedNet:value})

       } 

     }else if(value == 0){
       if(response.data.sky_MSPIL_ERP_API_HOST_LAN !== null){
          APIManager.setValueForKey('ipAddress', response.data.sky_MSPIL_ERP_API_HOST_LAN);
          APIManager.setValueForKey('networkType', "0");
          this.setState({netModal:!this.state.netModal, selectedNet:value})

     }

    }

       //alert(JSON.stringify(response))
    }, (error)=>{
       this.setState({netModal:!this.state.netModal, selectedNet:value})
       console.log(JSON.stringify(error))

     })
  
  }

deleteMedia(index){
    var array= this.state.imageData
    array.splice(index, 1);
   if(index==0){
      this.setState({imageData:array, image1:{}}); 

   }else if(index == 1){
      this.setState({imageData:array, image2:{}}); 

   } 
   
  }   


  render() {
         const modeList = this.state.modeList.map((item, key) => {  
         return (<Picker.Item label={item.M_Name } value={item.M_Code} key={key}/>)    
            })               
         modeList.unshift(<Picker.Item  key="" label="---New Mode---" value='0' />)

        const transporterList = this.state.transporterList.map((item, key) => {  
         return (<Picker.Item label={item.TR_Name + "("+item.TR_Code+")" } value={item.transport_ai_id} key={key}/>)    
            })               
         transporterList.unshift(<Picker.Item  key="" label="---New Transporter---" value='0' />)  

          const harvesterList = this.state.harvesterList.map((item, key) => {  
         return (<Picker.Item label={item.HR_Name + "("+item.HR_Code+")"} value={item.har_ai_id} key={key}/>)    
            })               
         harvesterList.unshift(<Picker.Item  key="" label="---New Harvester---" value='0' />) 

        const authPersonList = this.state.authPersonList.map((item, key) => {  
         return (<Picker.Item label={item.person_name } value={item.id} key={key}/>)    
            })               
         authPersonList.unshift(<Picker.Item  key="" label="---Order By---" value='0' />)  
    return (
      <SafeAreaView>
       <ImageBackground source={require('./../../assets/Splash.png')} style={{width:"100%", height:"100%"}}>
          <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
          <View style={{alignItems:"center"}}> 
              <Image
                  style={{width: width*0.5, height: height*0.25}}
                  resizeMode="contain"
                  source={require('./../../assets/ic_launcher.png')}
                />  
              <View style={{width:"80%"}}>  
                <Text style={styles.compName}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text>  
              </View> 

              <Text style={[styles.compName, {paddingTop:10}]}>Welcome Mr. {this.state.userData.displayName}</Text>  
            </View>
            <View style={{marginTop:15, paddingHorizontal:10}}>
              <View style={{justifyContent:"space-between", flexDirection:"row"}}>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal(true)} style={styles.button}>
                    <Text style={styles.btnText}>RFID Change</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal1(true)} style={styles.button}>
                    <Text style={styles.btnText}>Lock Token</Text>
                </TouchableOpacity> 
              </View>   

              <View style={{justifyContent:"space-between", flexDirection:"row"}}>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal2(true)} style={styles.button}>
                    <Text style={styles.btnText}>Bypass Token</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal3(true)} style={styles.button}>
                    <Text style={styles.btnText}>Change Mode</Text>
                </TouchableOpacity>
               </View>

              <View style={{justifyContent:"space-between", flexDirection:"row"}}>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal4(true)} style={styles.button}>
                    <Text style={styles.btnText}>Change Farmer</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal5(true)} style={styles.button}>
                    <Text style={styles.btnText}>Change Transporter</Text>
                </TouchableOpacity>
              </View>

              <View style={{flexDirection:"row", justifyContent:"space-between"}}>

                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal6(true)} style={styles.button}>
                    <Text style={styles.btnText}>Change Harvester</Text>
                </TouchableOpacity>
                
                 <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal7(true)} style={styles.button}>
                    <Text style={styles.btnText}>Burnt Flag</Text>
                </TouchableOpacity>
              </View>

            {(this.state.userData.roleName == "SUPER_ADMIN")?
              <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal8(true)} style={styles.button}>
                  <Text style={styles.btnText}>Lock/Unlock RFID</Text>
                </TouchableOpacity>
                
                <TouchableOpacity activeOpacity={.5} onPress={() => this.toggleModal9(true)} style={styles.button}>
                    <Text style={styles.btnText}>Unlock Token</Text>
                </TouchableOpacity>
              </View>:null} 
            </View>

             <View style={{alignItems:"center", marginTop:height*0.05}}>
                <Image
                  style={{width:width*0.5, height:height*0.1}}
                  resizeMode="contain"
                  source={require('./../../assets/logo.png')}
                />
             </View> 
            <Modal animationType = {"slide"} 
                   transparent = {true}
                    visible = {this.state.modalVisible}
                    onRequestClose = {() => {  global.EDPScreen.modalClose() } }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%'}}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose()}} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>RFID Change</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                        style={styles.modalInputInner}
                        onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                        value={this.state.codeNumber}
                        keyboardType='numeric'
                        returnKeyType="next"    
                        placeholder="Token No" 
                            //underlineColorAndroid='#000000'
                        /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()} style={styles.searchView}>
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>
                  
                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>RFID</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].RF_NO !== null)?this.state.tokenData[0].RF_NO.trim():""}</Text>:null}
                     </View>
                    </View>
          

                    <View style={styles.modalInput}>
                      <TextInput
                              onChangeText={(rfid) => this.setState({rfid})}
                              value={this.state.rfid}
                              style={styles.modalText}
                              placeholder="New RFID"
                              />
                    </View>

                    <View style={styles.modalInput}>
                      <TextInput
                              onChangeText={(reason) => this.setState({reason})}
                              value={this.state.reason}
                              style={styles.modalText}
                              placeholder="Reason"
                              multiline={true}
                              />
                    </View>
                   <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                       <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View>      
                    {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateRFID()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>


             <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.modalVisible1}
                    onRequestClose = {() => {  global.EDPScreen.modalClose()  } }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Lock Token</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                      style={styles.modalInputInner}
                      onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                      value={this.state.codeNumber}
                      keyboardType='numeric'
                      returnKeyType="next"    
                      placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
           
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>


                    <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.authPersonId} 
                      placeholder="Order By"     
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'  
                      onValueChange={(itemValue, itemIndex) => this.setState({authPersonId:itemValue})}        
                      > 
                        {authPersonList}               
                       </Picker>                                
                   </View>
                  </View>  

                    <View style={styles.modalInput}>
                    <TextInput
                            onChangeText={(reason) => this.setState({reason})}
                            value={this.state.reason}
                            style={styles.modalText}
                            placeholder="Reason"
                            multiline={true}
                            />
                    </View>
                  
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.tokenLock("A")} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>LOCK</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>



             <Modal animationType = {"slide"} transparent = {true}
                visible = {this.state.modalVisible2}
                onRequestClose = {() => {global.EDPScreen.modalClose()} }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                          <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Bypass Token</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                        style={styles.modalInputInner}
                        onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                        value={this.state.codeNumber}
                        keyboardType='numeric'
                        returnKeyType="next"    
                        placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
                        {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                        selectedValue={this.state.authPersonId}
                        placeholder="Order By"      
                        style={{ height: 40, width: '95%'}}
                        mode = 'dropdown'  
                        onValueChange={(itemValue, itemIndex) => this.setState({authPersonId:itemValue})}        
                        > 
                        {authPersonList}               
                       </Picker>                                
                   </View>
                  </View>  

                    <View style={styles.modalInput}>
                    <TextInput
                            onChangeText={(reason) => this.setState({reason})}
                            value={this.state.reason}
                            style={styles.modalText}
                            placeholder="Reason"
                            multiline={true}
                            />
                    </View>

                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.bypassToken()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>



             <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.modalVisible3}
                    onRequestClose = {() => {  global.EDPScreen.modalClose()  } }>
               
                <View  style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Change Mode</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                      style={styles.modalInputInner}
                      onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                      value={this.state.codeNumber}
                      keyboardType='numeric'
                      returnKeyType="next"    
                      placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
           
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Mode</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{this.state.tokenData[0].MODE_NAME.trim()}</Text>:null}
                     </View>
                    </View>

                

                   
                    <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.mode}      
                      style={{ height: 40, width: '95%'}}
                      placeholder="New Mode"
                      mode = 'dropdown'  
                      onValueChange={(itemValue, itemIndex) => this.setState({mode:itemValue})}        
                      > 
                        {modeList}               
                       </Picker>                                
                   </View>
                  </View>    

                    <View style={styles.modalInput}>
                      <TextInput
                              onChangeText={(reason) => this.setState({reason})}
                              value={this.state.reason}
                              style={styles.modalText}
                              placeholder="Reason"
                              multiline={true}
                              />
                    </View>

                   <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View> 
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateMode()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>


             <Modal animationType = {"slide"} transparent = {true}
                visible = {this.state.modalVisible4}
                onRequestClose = {() => { global.EDPScreen.modalClose() }}>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Change Farmer</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                        style={styles.modalInputInner}
                        onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                        value={this.state.codeNumber}
                        keyboardType='numeric'
                        returnKeyType="next"    
                        placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
           
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                 
                    <View style={styles.modalView}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Farmer Code</Text>
                     </View> 
                     <View style={{width:"60%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{this.state.tokenData[0].FARMER_CODE.trim()}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                   
                    <View style={styles.modalInput}>
                    <TextInput
                        onChangeText={(farmerCode) => this.setState({farmerCode})}
                        value={this.state.farmerCode}
                        style={styles.modalText}
                        placeholder="New Code"
                        keyboardType='numeric'
                            />
                    </View>

                    <View style={styles.modalInput}>
                    <TextInput
                          onChangeText={(reason) => this.setState({reason})}
                          value={this.state.reason}
                          style={styles.modalText}
                          placeholder="Reason"
                          multiline={true}
                            />
                    </View>

                    <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View>   
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateFarmer()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>


             <Modal animationType = {"slide"} transparent = {true}
                visible = {this.state.modalVisible5}
                onRequestClose = {() => {  global.EDPScreen.modalClose()  } }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                        <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Change Transporter</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                        style={styles.modalInputInner}
                        onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                        value={this.state.codeNumber}
                        keyboardType='numeric'
                        returnKeyType="next"    
                        placeholder="Token No" 
                      /> 
                    <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
         
                        {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                        <Icon name="search" size={25}  />} 
                    </TouchableOpacity>
                    </View>

                   
                   <View style={styles.modalView}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Farmer Code</Text>
                     </View> 
                     <View style={{width:"60%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_CODE !== null)?this.state.tokenData[0].FARMER_CODE.trim():""}</Text>:null}
                     </View>
                    </View>
                  
                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                   <View style={styles.modalView}>
                     <View style={{width:"35%"}}>
                      <Text style={styles.modalText}>Transporter</Text>
                     </View> 
                     <View style={{width:"65%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{this.state.tokenData[0].TR_Name.trim()}</Text>:null}
                     </View>
                    </View>

    
                   <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.transport}      
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'
                      placeholder="New Transporter"
                      onValueChange={(itemValue, itemIndex) => this.setState({transport:itemValue})}        
                      > 
                        {transporterList}               
                       </Picker>                                
                   </View>
                  </View> 

                      <View style={styles.modalInput}>
                      <TextInput
                              onChangeText={(reason) => this.setState({reason})}
                              value={this.state.reason}
                              style={styles.modalText}
                              placeholder="Reason"
                              multiline={true}
                              />
                    </View>

                     <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View>  
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateTransporter()}  style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
               </View> 
             </Modal>

             <Modal animationType = {"slide"}
                    transparent = {true}
                    visible = {this.state.modalVisible6}
                    onRequestClose = {() => {  global.EDPScreen.modalClose()  } }>
               <View  style={styles.modal}>
                 <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                          <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Change Harvester</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                      style={styles.modalInputInner}
                      onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                      value={this.state.codeNumber}
                      keyboardType='numeric'
                      returnKeyType="next"    
                      placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
                        {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                     
                   <View style={styles.modalView}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Farmer Code</Text>
                     </View> 
                     <View style={{width:"60%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{this.state.tokenData[0].FARMER_CODE.trim()}</Text>:null}
                     </View>
                    </View>

                   
                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>


                   <View style={styles.modalView}>
                     <View style={{width:"30%"}}>
                      <Text style={styles.modalText}>Harvester</Text>
                     </View> 
                     <View style={{width:"70%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{this.state.tokenData[0].HR_Name.trim()}</Text>:null}
                     </View>
                    </View>
               

                  <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.harvester}      
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'
                      placeholder="New Harvester" 
                      onValueChange={(itemValue, itemIndex) => this.setState({harvester:itemValue})}        
                      > 
                        {harvesterList}               
                       </Picker>                                
                   </View>
                  </View> 

                    <View style={styles.modalInput}>
                    <TextInput
                            onChangeText={(reason) => this.setState({reason})}
                            value={this.state.reason}
                            style={styles.modalText}
                            placeholder="Reason"
                            multiline={true}
                            />
                    </View>
                  <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View>  
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateHarvester()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
              </View>
             </Modal>


              <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.modalVisible7}
                    onRequestClose = {() => {  global.EDPScreen.modalClose()  } }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose() }} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Update Burnt Flag</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                      style={styles.modalInputInner}
                      onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                      value={this.state.codeNumber}
                      keyboardType='numeric'
                      returnKeyType="next"    
                      placeholder="Token No" 
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
           
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                     <View style={styles.modalView}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Farmer Code</Text>
                     </View> 
                     <View style={{width:"60%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_CODE !== null)?this.state.tokenData[0].FARMER_CODE.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={[{borderBottomWidth:StyleSheet.hairlineWidth}, styles.modalView]}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                     <View style={[{marginTop:5}, styles.modalView]}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Burnt Cane</Text>
                     </View> 
                     <View style={{width:"55%", alignItems:"flex-end"}}>
                       <TouchableOpacity onPress={() => this.setState({ checked: !this.state.checked })} style={{paddingTop:5}}>
                        <CheckBox
                          checked={this.state.checked}
                          color="#000000"
                          onPress={() => this.setState({ checked: !this.state.checked })}
                        /> 
                      </TouchableOpacity> 
                     </View>
                    </View>


                    <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.authPersonId} 
                      placeholder="Order By"     
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'  
                      onValueChange={(itemValue, itemIndex) => this.setState({authPersonId:itemValue})}        
                      > 
                        {authPersonList}               
                       </Picker>                                
                   </View>
                  </View>


                    <View style={styles.modalInput}>
                    <TextInput
                            onChangeText={(reason) => this.setState({reason})}
                            value={this.state.reason}
                            style={styles.modalText}
                            placeholder="Reason"
                            multiline={true}
                            />
                    </View>

                     <View style={styles.imageContainer}>
                    
                    {(this.state.image1.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(0)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                       <Image source={{uri: this.state.image1.uri}} style={styles.imageView2} />
                       <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(0)}>
                         <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                       </TouchableOpacity>
                     </View>
                    }
                    
                    
                   {(this.state.image2.uri == null)?
                      <TouchableOpacity style={styles.imageView1} onPress={()=> this._handleCameraButtonPress(1)} >
                      <Icon type="MaterialIcons" name="camera-alt" size={30} color="#900" />
                     </TouchableOpacity>:
                     <View style={{width:"45%"}}>
                      <Image source={{uri: this.state.image2.uri}} style={styles.imageView2} />
                      <TouchableOpacity style={styles.deleteImageBackground} onPress={() => this.deleteMedia(1)}>
                       <Icon name="close" type="AntDesign" style={{fontSize: 15}} />
                     </TouchableOpacity> 
                     </View>
                    }
                    </View> 
                  
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.updateBurntFlag()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>

              <Modal animationType = {"slide"} 
                   transparent = {true}
                    visible = {this.state.modalVisible8}
                    onRequestClose = {() => { global.EDPScreen.modalClose() } }>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => { global.EDPScreen.modalClose()}} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>

                    </View>
                   <Text style = {styles.text}>Lock/Unlock RFID</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                        style={styles.modalInputInner}
                        onChangeText={(codeNumber) => this.setState({codeNumber, validRFID:null, canUpdate:false})}
                        value={this.state.codeNumber}
                        returnKeyType="next"    
                        placeholder="Search RFID" 
                            //underlineColorAndroid='#000000'
                        /> 
                      <TouchableOpacity onPress={()=>this.getRFIDDetails()} style={styles.searchView}>
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>
                   
                    {(this.state.validRFID == true)?
                      <Text style={{color:"green", fontSize:12, textAlign:"center"}}>RFID Validated</Text>:null
                    }

                     {(this.state.validRFID == false)?
                      <Text  style={{color:"red", fontSize:12, textAlign:"center"}}>Invalid RFID</Text>:null
                     }
          
                    <View style={[{marginTop:10}, styles.modalView]}>
                     <View style={{width:"40%"}}>
                      <Text style={styles.modalText}>Lock RFID</Text>
                     </View> 
                     <View style={{width:"55%", alignItems:"flex-end"}}>
                       <TouchableOpacity onPress={() => this.setState({ checked: !this.state.checked })} style={{paddingTop:5, width:"20%"}}>
                        <CheckBox
                          checked={this.state.checked}
                          color="#000000"
                          onPress={() => this.setState({ checked: !this.state.checked })}
                        /> 
                      </TouchableOpacity> 
                     </View>
                    </View>

                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000", marginTop:10}}>     
                     <Picker
                      selectedValue={this.state.authPersonId} 
                      placeholder="Order By"     
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'  
                      onValueChange={(itemValue, itemIndex) => this.setState({authPersonId:itemValue})}        
                      > 
                        {authPersonList}               
                       </Picker>                                
                   </View>
          
                    <View style={styles.modalInput}>
                      <TextInput
                              onChangeText={(reason) => this.setState({reason})}
                              value={this.state.reason}
                              style={styles.modalText}
                              placeholder="Reason"
                              multiline={true}
                              />
                    </View>
          
                    {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.lockUnlockRFID()} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UPDATE</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>

               <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.modalVisible9}
                    onRequestClose = {() => { global.EDPScreen.modalClose()}}>
               
                <View style = {styles.modal}>
                <View style={styles.modalView1}>
                    <View style={{flexDirection:'row'}}>
                        <View style={{width:'90%', }}></View>
                        <TouchableHighlight onPress = {() => {global.EDPScreen.modalClose() }} style={{}}>
                         <Icon name="closecircleo" type="AntDesign" size={10}  />
                        </TouchableHighlight>
                    </View>
                   <Text style = {styles.text}>Unlock Token</Text>
                   <View style={styles.modalInnerView}>
                     <TextInput
                      style={styles.modalInputInner}
                      onChangeText={(codeNumber) => this.setState({codeNumber, canUpdate:false})}
                      value={this.state.codeNumber}
                      keyboardType='numeric'
                      returnKeyType="next"    
                      placeholder="Token No"
                      /> 
                      <TouchableOpacity onPress={()=>this.getTokenDetailsToChange()}  style={styles.searchView}>
                          {(this.state.isLoading==true)?<ActivityIndicator size="small" color="#000000" />:
                          <Icon name="search" size={25}  />} 
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Name</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].FARMER_NAME !== null)?this.state.tokenData[0].FARMER_NAME.trim():""}</Text>:null}
                     </View>
                    </View>

                    <View style={styles.modalView}>
                     <View style={{width:"25%"}}>
                      <Text style={styles.modalText}>Village</Text>
                     </View> 
                     <View style={{width:"75%"}}>
                      {(this.state.tokenData.length > 0)? 
                      <Text style={[styles.modalText, {textAlign:"right"}]}>{(this.state.tokenData[0].VILL_NAME !== null)?this.state.tokenData[0].VILL_NAME.trim():""}</Text>:null}
                     </View>
                    </View>


                    <View style={{marginTop:10}}>
                    <View style={{ borderWidth:1, borderRadius:5, borderColor:"#000000",}}>     
                     <Picker
                      selectedValue={this.state.authPersonId} 
                      placeholder="Order By"     
                      style={{ height: 40, width: '95%'}}
                      mode = 'dropdown'  
                      onValueChange={(itemValue, itemIndex) => this.setState({authPersonId:itemValue})}        
                      > 
                        {authPersonList}               
                       </Picker>                                
                   </View>
                  </View>  

                    <View style={styles.modalInput}>
                    <TextInput
                            onChangeText={(reason) => this.setState({reason})}
                            value={this.state.reason}
                            style={styles.modalText}
                            placeholder="Reason"
                            multiline={true}
                            />
                    </View>
                  
                   {(this.state.isLoading==true)?<ActivityIndicator style={{margin:10}}  size="small" color="#000000" />:
                   <TouchableHighlight onPress={()=>this.tokenLock("D")} style={styles.updateBtn}>
                      <Text style = {styles.btnText}>UNLOCK</Text>
                   </TouchableHighlight>}
                </View>
                </View>
             </Modal>

            </ScrollView>
              <TouchableOpacity  onPress={this.showMenu} style={{position:"absolute", right:10, top:(Platform.OS === "ios")?20:10}}>
                 <Menu 
                  ref={this.setMenuRef}
                  button={<Icon  name='ellipsis-v' type="FontAwesome"     
                                 style={{fontSize:25, color:'#000000'}}
                                 onPress={this.showMenu} /> 
                 }
                >
                  <MenuItem onPress={() => this.onLogOut()}>Log Out</MenuItem>
                </Menu>
             </TouchableOpacity>

             <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.netModal}
                    onRequestClose = {() => this.switchNet()}>
               
                <View  style = {styles.modal}>
                  <View style={styles.modalView1}>
                   <RadioGroup 
                      size={24} 
                      thickness={2}
                      color='#232f3e'
                      selectedIndex={this.state.selectedNet}
                      onSelect = {(index, value) => this.getIpAddress(value)}
                     >
                      <RadioButton value={'0'} >
                        <Text>Local(LAN)</Text> 
                      </RadioButton>
               
                      <RadioButton value={'1'}>
                        <Text>Internet(WAN)</Text>
                      </RadioButton>
               
                    </RadioGroup>   
                    
                  </View>
                </View>
          </Modal>   
      </ImageBackground>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create ({
   compName: {
       fontSize:width*0.05, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center",
    },
   button: {
    elevation:8,  width:'48%', justifyContent:'center', alignItems:'center', backgroundColor:'#8db301', paddingVertical:height*0.018, borderRadius:25, marginTop:height*0.015
   },
   btnText:{
    fontSize:width*0.04, fontFamily: "Lato-Semibold", color:'#FFFFFF'
   },  
   modal: {
      flex: 1,  justifyContent: 'center', alignItems: 'center',backgroundColor:'#00000080'
    },
   modalView1:{
     width: '85%',backgroundColor:'#ffffff', borderRadius:10, justifyContent:'center', padding:15 
    },
    text: {
       color: '#000', fontSize:18, fontFamily: "Lato-Semibold", textAlign:'center', marginVertical:10
    },
    modalView:{
      flexDirection:'row',
    },
    modalInnerView:{
      flexDirection:'row', borderWidth:1, borderColor:'#000', borderRadius:5
    },
    searchView:{
        padding:10,  alignItems:"center"
    },
    modalText:{
        fontSize:15, color:'#000', padding:5,fontFamily: "Lato-Semibold"
    },
    modalInput: {
        marginTop:10, borderBottomWidth:1, borderColor:'#000', borderRadius:5,
    },
    modalInputInner: {
        width:"82%", fontSize:15,  paddingLeft:10
    },
    imageContainer:{
        flexDirection:"row", justifyContent:"space-between", marginVertical:10, height:height*0.2
    },
    imageView1:{
       width:"45%", justifyContent:'center', alignItems:'center', borderRadius:5,  backgroundColor:"#dcdcdc60"
    },
    imageView2:{
     width:"100%", height:"100%", borderRadius:5, borderWidth:1
    },
    updateBtn: {
      marginTop:10, backgroundColor:'#8db301', elevation:4, borderRadius:50, alignSelf:'center', padding:10, marginVertical:10, width:"50%", alignItems:"center"
    },
    deleteImageBackground: {
      position: 'absolute',
      right: 0,
      zIndex: 0,  
      margin: 5,
      backgroundColor: "#fff",
      padding:3,
      borderRadius: 10,
      alignItems: 'center',
  },
 })
