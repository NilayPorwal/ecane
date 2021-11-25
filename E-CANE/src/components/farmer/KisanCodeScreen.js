import React, { Component } from 'react';
import {Dimensions, StyleSheet, Text, View, ImageBackground, Image, ScrollView, 
        TouchableOpacity, BackHandler, Alert, FlatList, Platform, ActivityIndicator, Animated } from 'react-native';
import I18n, { getLanguages } from 'react-native-i18n';
import { Icon } from 'native-base';
import APIManager from './../APIManager';
import { encrypt, decrypt } from "./../AESEncryption"
var base64 = require('base-64');  
import axios from 'axios';
var dateFormat = require('dateformat');
import Storage from 'react-native-storage';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { Card} from 'native-base';

const {height, width} = Dimensions.get('window');
I18n.fallbacks = true;
   
I18n.translations = {
  'en': require('./../../translations/en'),
  'hi': require('./../../translations/hi'),

};

export default class KisanCodeScreen extends Component {
      constructor(props) {
          super(props);
          this.state = {
            isLoading:true,
            farmerTokenData:[],
            tareData:[],
            userData:{},
            farmerCodeList:[],
            farmertareData:[],
            language:"English",
            lastToken:[]
            }
            global.KisanCodeScreen = this;
            this.animatedValue = new Animated.Value(0);
            this.value = 0;
            this.animatedValue.addListener(({ value }) => {
              this.value = value;
            }) 
          }


    static navigationOptions = {
        header: null,
             
    }; 

  async componentDidMount(){
      if(APIManager.isDev != true){ 
       await APIManager.setHost()
      }
       BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);    
       this.getFarmerTokenDetails()
       this.getLastTokenActivity()
       //this.getLastTokenGrossData()
       this.retriveData()
     
      setInterval( () => {
        this.getFarmerTokenDetails()
        this.getLastTokenActivity()
      },240000)

    }

      handleAndroidBackButton() {
      if(global.KisanCodeScreen.state.userData.roleName == "SUPER_ADMIN"){
          global.KisanCodeScreen.props.navigation.goBack();
        }else{
            BackHandler.exitApp(); 
        }
         return true;
       }       
    
    componentWillUnmount() {
       BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
      
    }

 retriveData(){
    APIManager.getValueForKey('userData', (data)=>{
     if(data != null ){ 
      console.log("User Data " + JSON.stringify(data));
      this.setState({userData:data})

    }
    },(error)=>{
         console.log("User Data " + JSON.stringify(error));
    })
  }

  getFarmerTokenDetails() {
     setTimeout(()=>{
          if(this.state.isLoading == true){
           this.setState({isLoading:false})
         }
        }, 10000)
    APIManager.getFarmerTokenDetails((response)=>{
        console.log(JSON.stringify(response));   
         if (response.data.status === "SUCCESS") {
            response.data.data = JSON.parse(decrypt(response.data.data.content));
            console.log("Farmer Token Details: " + JSON.stringify(response.data));

              this.setState({farmerTokenData:response.data.data, farmerCodeList:[...response.data.data], 
                             selectedCode:response.data.data.length, isLoading:false}) 
    
          } else { 
            this.setState({isLoading:false})           
            console.log('error', response);
           // Alert.alert('Error',  response.data.message);    
          }  
          
     }, (error)=>{
        this.setState({isLoading:false}) 
         console.log('error', error);
     })

   }


  getLastTokenActivity(){
    //this.setState({lastToken:[]})
    
      APIManager.getLastTokenActivity((responseJson)=> {
        this.setState({loading:false})
         if(responseJson.data.status=='SUCCESS'){
           responseJson.data.data = JSON.parse(decrypt(responseJson.data.data.content));
           console.log("Last Token Activity " + JSON.stringify(responseJson.data));
           this.setState({lastToken:responseJson.data.data})
           this.flip_Card_Animation()
         }    
       },(error)=>{
         this.setState({loading:false})
         console.log(JSON.stringify(error));
       })
      
   }




 onCodePress(index){
  if(index < this.state.farmerTokenData.length){
     // this.setState({selectedCode:index, selectedAll:false})
     // this.getFarmerTareDetails(this.state.farmerData[index].account_user_id)
     // this.getFarmerTotalTareDetails(this.state.farmerData[index].account_user_id)
     this.props.navigation.push("WeightDetailsScreen", {
      farmerCode:this.state.farmerTokenData[index].account_user_id,
      language:(this.state.language=="हिंदी")?"en":"hi"
     })
  }else{
     this.setState({selectedCode:index,selectedAll:true})
  }
 }   


 onLogOut(){
    Alert.alert(
      I18n.t("Logout Confirmation"),
      I18n.t('Do you want to Logout ?'),      
      [
        { 
          text:  I18n.t("No"),
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: I18n.t("Yes"), onPress: () => this.logOut()},
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
  })
     this.setState({farmertareData:[], farmerCodeList:[], userData:{}})
     this.props.navigation.push("LoginScreen")
      APIManager.removeValueForKey()
  
} 

 componentWillMount() {
    I18n.locale = 'hi';
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

  onLanguageChange(){
     I18n.locale = (this.state.language=="हिंदी")?"hi":"en";
    this.setState({language:(this.state.language=="हिंदी")?"English":"हिंदी"})
  
  }

   flip_Card_Animation(){
      
      if (this.value >= 90) {
 
        Animated.spring(this.animatedValue,{
          toValue: 0,
          tension: 10,
          friction: 8,
        }).start();
 
      } else {
 
        Animated.spring(this.animatedValue,{
          toValue: 180,
          tension: 10,
          friction: 8,
        }).start();
 
      }
 
    }   


  render() {
      this.SetInterpolate = this.animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '360deg']
      })
 
      const Rotate_Y_AnimatedStyle = {
        transform: [
          { rotateX: this.SetInterpolate }
        ]
       }
    return (
       <ImageBackground source={require('./../../assets/Splash.png')} style={{flex:1}}>
          <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
          <View style={{alignItems:"center", marginTop:"5%"}}> 
              <Image
                  style={{width: width*0.6, height: height*0.2}}
                  //resizeMode="contain"
                  source={require('./../../assets/ic_launcher.png')}
                />  
              <View style={{width:"80%"}}>  
                <Text style={{fontSize:width*0.04, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center"}}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text>  
              </View>
            </View>

            <Text style={{fontSize:width*0.04, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center", paddingTop:10}}>{I18n.t("Financial Year")} - 2019 - 20</Text>
            <Text style={{fontSize:width*0.04, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center", paddingTop:10}}>{this.state.userData.mobile}</Text>  

          <Animated.View style={{margin:10}}>
           <Card>
          {(this.state.lastToken.length > 0)?
            <View style={styles.row}>
              <View style={{width:"30%"}}> 
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>{I18n.t("Slip")} ({I18n.t("Counter")})</Text>
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.state.lastToken[0].stage} ({this.state.lastToken[0].counter_no})</Text>
               </View>

               <View style={{width:"30%", alignItems:"flex-start"}}> 
                <Text style={{fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>{I18n.t("Current")} {I18n.t("Slip No")}</Text>
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.state.lastToken[0].swtm_tk_slip_no}</Text>
               </View>
              
               <View style={{width:"40%", alignItems:"center"}}> 
                <Text style={{fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>{I18n.t("Date")}</Text>
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.state.lastToken[0].lastuseddate}</Text>
               </View>
            </View>:null} 
           <TouchableOpacity onPress={()=>this.props.navigation.navigate("LastTokenDetails", {language:I18n.locale})}>
            <Text style={{color:"#3473c3", fontSize:width*0.04, fontFamily:"Lato-Semibold", textAlign:"center", padding:10}}>{I18n.t("Show Token Activity")}</Text>
           </TouchableOpacity> 
          </Card>
          </Animated.View> 

           {(this.state.isLoading == false && this.state.farmerCodeList.length == 0)? 
            <Text style={{marginTop:height*0.04,fontSize:18, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center", paddingBottom:15}}>{I18n.t("No Accounts Available")}</Text>:
            
             <View style={[{padding:10, marginTop:height*0.01}]}>  
              <Text style={{fontSize:width*0.045, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center", paddingBottom:10}}>{I18n.t("Your Accounts")}</Text>  
              
             {(this.state.isLoading == false)? 
              <FlatList  
                data={this.state.farmerCodeList}
                extraData={this.state}
                numColumns={2}
                renderItem={({item, index}) => 
                  <TouchableOpacity activeOpacity={0.5}  onPress={()=>this.onCodePress(index)} style={{elevation:8, backgroundColor:'#006344', borderRadius:25, padding:10, marginTop:10, marginHorizontal:10, width:"45%", alignItems:"center"}}>
                   <Text style={{color:"#ffffff", fontSize:width*0.04, fontFamily: "Lato-Semibold"}}>{item.account_user_id}</Text> 
                  </TouchableOpacity >
                }
              />:<ActivityIndicator size="small" color="#000000" style={{marginTop:10}}/>}
            
           </View>}

             <View style={{alignItems:"center", marginTop:10}}>
                <Image
                  style={{width:width*0.5, height:height*0.1}}
                  resizeMode="contain"
                  source={require('./../../assets/logo.png')}
                />
             </View> 

         </ScrollView>
             

             <TouchableOpacity  onPress={this.showMenu} style={{position:"absolute", right:10, top:(Platform.OS === "ios")?20:10}}>
                 <Menu 
                  ref={this.setMenuRef}
                  button={<Icon  name='dots-vertical' type="MaterialCommunityIcons"     
                                 style={{fontSize:25, color:'#000000'}}
                                 onPress={this.showMenu} /> 
                 }
                >
                  <MenuItem onPress={()=>this.onLanguageChange()}>{this.state.language}</MenuItem>
                  <MenuDivider />
                  <MenuItem onPress={() => this.onLogOut()}>Log Out</MenuItem>
                </Menu>
             </TouchableOpacity>

              <TouchableOpacity  onPress={()=>this.props.navigation.navigate("NotificationScreen")} style={{position:"absolute", right:50, top:(Platform.OS === "ios")?20:10}}>
               <Icon  name='bell' type="MaterialCommunityIcons"  style={{fontSize:25, color:'#000000'}} /> 
             </TouchableOpacity>
              
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    elevation:5, height:50, backgroundColor:"#8db301", justifyContent:"space-between", flexDirection:"row", alignItems:"center", paddingHorizontal:15
  },

  cardStyle:{
   margin:10, elevation:8, backgroundColor:'#ffffff', borderRadius:5
  },
  tableText:{
     fontFamily: "Lato-Semibold", color:"#000000", fontSize:15,  textAlign:"center"
  },
  farmerDetailsText:{
     color:'#000000', fontSize:15,  fontFamily: "Lato-Semibold", paddingTop:5
  }, 
  farmerDetailsView:{
    flexDirection: 'row', justifyContent:"space-between"
  },
  farmerDetailsView2:{
    backgroundColor:"#d3d3d3", borderBottomColor:"#ffffff", borderBottomWidth:1, padding:10
  },
  noDataView:{
    alignItems:"center", justifyContent:"center", height:100
  },
  noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  },
  row:{
    flexDirection: 'row', padding:10,backgroundColor: "#d8a800",
  },

});
