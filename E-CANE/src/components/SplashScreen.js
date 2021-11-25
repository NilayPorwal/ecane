import React, {Component} from 'react';
import {Linking, Platform, StyleSheet, View, Image, Dimensions, TextInput, AsyncStorage, ImageBackground, Text, Modal, TouchableHighlight,PermissionsAndroid} from 'react-native';
import Storage from 'react-native-storage';
import APIManager from './APIManager';
import { encrypt, decrypt1,  decrypt} from "./AESEncryption"
import axios from 'axios';
import VersionCheck from 'react-native-version-check';
import Geolocation from 'react-native-geolocation-service';


 const storage = new Storage({
          storageBackend: AsyncStorage, 
          enableCache: true, 
        });

const {height, width} = Dimensions.get('window');

export default class SplashScreen extends Component {

constructor(props) {
  super(props);
  this.state ={
     isRefreshing:true,
     modalVisible:false
    }
}

static navigationOptions = {
          header: null,
 };
 
async componentDidMount(){
 if(APIManager.isDev != true){ 
   await this.getIpAddress()
  }
  this.initPermissions();
///  this.checkVersion();
  //this.getPublicAppConfigList();
  this.loadData();
}

async initPermissions() {
  if(Platform.OS == 'ios'){
      Geolocation.requestAuthorization("whenInUse");
  }else {
     const granted = await PermissionsAndroid.requestMultiple(
      [PermissionsAndroid.PERMISSIONS.CAMERA,
       PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
       PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ] 
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the location');
    } else {
      console.log('Location permission denied');
    }

  }
}

redirectTo(screen){
   this.props.navigation.push(screen)
}

loadData(){
  setTimeout(()=>{
  
    APIManager.getValueForKey('screenType', (data)=>{
       if(data != null){ 
        console.log("Screen Type " + JSON.stringify(data));
        this.redirectTo(data.screenType)
       }
       else{
        this.redirectTo("LoginScreen")
       }

    }, (error)=>{
       this.redirectTo("LoginScreen")
    })
  },1500 ) 

}


checkVersion(){
  VersionCheck.needUpdate()
    .then(async res => {
      //alert(JSON.stringify(res))
      if (res.isNeeded) {
       this.setState({modalVisible:true})
      } 
    })
    .catch((err)=>{
      console.log(JSON.stringify(err))
    })
} 

getPublicAppConfigList() {

  APIManager.getPublicAppConfigList((response)=>{
      console.log(JSON.stringify(response));   
       if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
          console.log("Get Public Configuration: " + JSON.stringify(response.data));

        
        } else { 
          console.log('Get Public Configuration error', response);
         // Alert.alert('Error',  response.data.message);    
        }  
        
   }, (error)=>{
       console.log('Get Public Configuration error', error);
   })
   
 }

 onUpdate(){
  if(Platform.OS == "android"){
    Linking.openURL("https://play.google.com/store/apps/details?id=in.skyras.e_cane"); 
   }
 }

getIpAddress(){
   
    APIManager.getIpAddress((response)=>{
      //alert(JSON.stringify(response))
      //this.setIpAddress(response)
      APIManager.setValueForKey('multiHost', response.data.sky_MSPIL_ERP_API_HOST_MULTI);
      APIManager.setValueForKey('lanHost', response.data.sky_MSPIL_ERP_API_HOST_LAN);


    }, (error)=>{
       console.log(JSON.stringify(error))
    })
}

setIpAddress(res){
   
   APIManager.getValueForKey('networkType', (data)=>{
      if(data == 1){
       if(res.data.sky_MSPIL_ERP_API_HOST !== null){
          APIManager.setValueForKey('ipAddress', res.data.sky_MSPIL_ERP_API_HOST);
      
       } 

     }else if(data == 0){
       if(res.data.sky_MSPIL_ERP_API_HOST_LAN !== null){
          APIManager.setValueForKey('ipAddress', res.data.sky_MSPIL_ERP_API_HOST_LAN);
        }  
     }

    },(error)=>{
       if(res.data.sky_MSPIL_ERP_API_HOST_LAN !== null){
          APIManager.setValueForKey('ipAddress', res.data.sky_MSPIL_ERP_API_HOST_LAN);
      
       } 
         console.log("User Data " + JSON.stringify(error));
    })
  
}

   
render() {

  return(

      <ImageBackground source={require('../assets/splash-bg.png')} style={{width: '100%', height: '100%'}}>
       <View style={styles.mainContainer}>
          
      <Image
          style={{width: width*0.5, height: height*0.3}}
          resizeMode="contain"
          source={require('../assets/ic_launcher.png')}
        /> 

      <View style={{width:"80%"}}>  
        <Text style={{fontSize:18, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center"}}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text>  
       </View> 
   
       <View style={{marginTop:height*0.1}}>
          <Image
           style={{width:width*0.5, height:height*0.1}}
           resizeMode="contain"
           source={require('../assets/logo.png')} />
       </View>   

       </View>

       <Modal animationType = {"slide"} 
              transparent = {true}
              visible = {this.state.modalVisible}
             >
             
              <View style = {styles.modal}>
              <View style={styles.modalView1}>
                  <Text style={{fontSize:18, fontFamily:"Lato-Black", paddingTop:15,  textAlign:"center"}}>App Update</Text>
                 {(Platform.OS === "ios")? 
                  <Text style={{fontSize:15, fontFamily:"Lato-Semibold", paddingTop:15,  textAlign:"center"}}>New version of app is available on App Store</Text>:
                  <Text style={{fontSize:15, fontFamily:"Lato-Semibold", paddingTop:15,  textAlign:"center"}}>New version of app is available on Play Store</Text>}

                <View style={{alignItems:"center"}}>
                 <TouchableHighlight onPress={()=>this.onUpdate()} style={styles.updateBtn}>
                    <Text style = {styles.btnText}>UPDATE</Text>
                 </TouchableHighlight>
                 {
                 //  <TouchableHighlight onPress={()=>this.setState({modalVisible:false})} style={styles.updateBtn}>
                 //    <Text style = {styles.btnText}>CANCEL</Text>
                 // </TouchableHighlight>
                }
                </View>
              </View>
              </View>
           </Modal>

      
    </ImageBackground>  

     );
  }
}

// Styles
const styles = StyleSheet.create({

  // Containers
  mainContainer: {
    flex: 1,
    justifyContent:"center",
    alignItems:"center"

  },
   modal: {
      flex: 1,  justifyContent: 'center', alignItems: 'center',backgroundColor:'#00000080'
    },
  modalView1:{
     width: '85%',backgroundColor:'#ffffff', borderRadius:10, justifyContent:'center', padding:15 
    },
   updateBtn: {
      marginTop:10, backgroundColor:'#8db301', elevation:4, borderRadius:50, alignSelf:'center', padding:10, marginVertical:10, width:"45%", alignItems:"center"
    },
   btnText:{
    fontSize:15, fontFamily: "Lato-Semibold", color:'#FFFFFF'
   },  

});