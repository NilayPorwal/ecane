import React, { Component } from 'react';
import {Dimensions, Text, View, ImageBackground, Image, ScrollView, SafeAreaView,
        TouchableOpacity, BackHandler, StyleSheet, Alert, Modal, StatusBar, ActivityIndicator } from 'react-native';
import APIManager from './APIManager';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import { Icon, Picker } from 'native-base';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import { encrypt, decrypt } from "./AESEncryption"

const {height, width} = Dimensions.get('window');
import DeviceInfo from 'react-native-device-info';
import UserContext from './UserContext';



export default class SuperAdmin extends Component {
     constructor(props) {
        super(props);
        this.state = {
           userData:{},
           netModal:false,
           selectedNet:0,
           intentModal:false,
           intent:"N",
           intentData:[],
           isRefreshing:false
        }
      }

  static navigationOptions = {
        header: null,
             
  }; 

static contextType = UserContext

 async componentDidMount() {
      await this.retriveData();
      //const userData = this.context
      this.setState({userData})
      this.getIntent()
      BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);
      
    }
    
  handleAndroidBackButton() {   
       BackHandler.exitApp(); 
        return true;
  }      
               
       
  componentWillUnmount() {
      BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);    
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
   //this.setState({ userData:{}})
   this.props.navigation.push("LoginScreen")

  
 }
 
 switchNet(){
   this.hideMenu();
   if(Platform.OS == "android"){
    APIManager.getValueForKey('networkType', (data)=>{
     if(data != null ){ 
      this.setState({selectedNet:data, netModal:!this.state.netModal})

    }
    },(error)=>{
         this.setState({netModal:!this.state.netModal})
         console.log("Network Type " + JSON.stringify(error));
    })
   } 
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
    }, (error)=>{
        this.setState({netModal:!this.state.netModal, selectedNet:value})
        console.log(JSON.stringify(error))

     })
  
  }
  
  getIntent(){
    const data = {
      "pCameraUrl": "GENERATE_INDENT"
    }
    APIManager.getIntent(data, (response)=>{
        // console.log(JSON.stringify(response))
         if(response.data.status == "SUCCESS"){
           response.data.data = JSON.parse(decrypt(response.data.data.content));
           console.log("Intent Details: " + JSON.stringify(response.data));
           this.setState({intentData:response.data.data, intent:response.data.data[0].config_value})
         }
    }, (error)=>{
        console.log(JSON.stringify(error))
     })
  
  }

  updateIntent(){
    this.setState({isRefreshing:true})
    const data = {"pConfigId":this.state.intentData[0].config_id,
                  "pKey":this.state.intentData[0].config_type,
                  "pValue":this.state.intent,
                  "pDesc":this.state.intentData[0].config_desc,
                  "pInsertedBy":parseInt(this.state.userData.userId)}
    APIManager.updateIntent(data, (response)=>{
        // console.log(JSON.stringify(response))
           this.setState({isRefreshing:false})
         if(response.data.status == "SUCCESS"){
           response.data.data = JSON.parse(decrypt(response.data.data.content));
           console.log("Intent Details: " + JSON.stringify(response.data));
           this.setState({intentModal:false})
           Alert.alert("Successfully Updated")
         }
    }, (error)=>{
        console.log(JSON.stringify(error))
         this.setState({isRefreshing:false})
     })
  
  }

  onNotification(){
    this.hideMenu()
    this.props.navigation.push("NotificationScreen")
  }


  render() {
    return (
    <SafeAreaView style={{flex:1}}>
      <StatusBar backgroundColor="#3473c3" barStyle="light-content" />

       <ImageBackground source={require('./../assets/Splash.png')} style={{width:"100%", height:"100%"}}>
          <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
          <View style={{alignItems:"center", marginTop:"5%"}}> 
              <Image
                  style={{width: width*0.5, height: height*0.25}}
                  resizeMode="contain"
                  source={require('./../assets/ic_launcher.png')}
                  
                />  
              <View style={{width:"80%"}}>  
                <Text style={styles.compName}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text> 
                <Text style={{fontSize:15, color:"#000000", textAlign:"center"}}>Session : 2020-21</Text>  
              </View> 

                <Text style={[styles.compName, {paddingTop:10}]}>Welcome Mr. {this.state.userData.displayName}</Text>  
            </View> 

          {(this.state.userData.roleName == "SUPER_ADMIN")&&
            <View style={{marginTop:height*0.025}}>
               <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:10, marginHorizontal:10}}>
                  <TouchableOpacity activeOpacity={0.5}  onPress={() => this.props.navigation.navigate('AdminScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>MANAGEMENT</Text>
                  </TouchableOpacity>

                   <TouchableOpacity activeOpacity={0.5}  onPress={() => this.props.navigation.navigate('ReportsScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>REPORTS</Text>
                  </TouchableOpacity>
                </View>

                <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:10, marginHorizontal:10}}>

                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('TokenDetails')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>CANE MANAGER</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('LandingSurveyScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>SURVEYOR</Text>
                  </TouchableOpacity>

                </View>
               
                <View style={{flexDirection:'row', justifyContent:'space-around', marginTop:10, marginHorizontal:10}}>

                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('KisanCodeScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>FARMER</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('EDPScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>EDP</Text>
                  </TouchableOpacity>

                </View>

                <View style={{marginTop:height*0.03, flexDirection:'row', justifyContent:'space-around', marginTop:15, marginHorizontal:10}}>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('AddFarmer')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>Add Farmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.setState({intentModal:true})} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>Generate Intent</Text>
                  </TouchableOpacity>   
                </View>

            </View>}
            {(this.state.userData.roleName == "EDPMANAGER" || this.state.userData.roleName == "EDP_MANAGER" || this.state.userData.roleName == "EDP-MANAGER")&&
                <View style={{marginTop:height*0.03, flexDirection:'row', justifyContent:'space-around', marginTop:15, marginHorizontal:10}}>

                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('ReportsScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>REPORTS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('EDPScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>EDP</Text>
                  </TouchableOpacity>

                </View>}
                {/* <View style={{marginTop:height*0.03, flexDirection:'row', justifyContent:'space-around', marginTop:15, marginHorizontal:10}}>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('AddFarmer')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>Add Farmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.setState({intentModal:true})} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>Generate Intent</Text>
                  </TouchableOpacity>  
                </View> */}
                {(this.state.userData.roleName == "GENERAL_MANAGER")&& 
                <View style={{marginTop:height*0.03, flexDirection:'row', justifyContent:'space-around', marginTop:15, marginHorizontal:10}}>
                <TouchableOpacity activeOpacity={.5}  onPress={() => this.props.navigation.navigate('ReportsScreen')} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>REPORTS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={.5}  onPress={() => this.setState({intentModal:true})} style={styles.button}>
                    <Text selectable={true} style={styles.btnText}>Generate Intent</Text>
                  </TouchableOpacity>  
                </View> }

               <View style={{alignItems:"center", marginTop:height*0.05}}>
                  <Image
                    style={{width:width*0.5, height:height*0.1}}
                    resizeMode="contain"
                    source={require('./../assets/logo.png')}
                  
                  />
               </View>

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
              <TouchableOpacity  onPress={()=>this.props.navigation.navigate("NotificationScreen")} style={{position:"absolute", right:50, top:(Platform.OS === "ios")?20:10}}>
               <Icon  name='bell' type="MaterialCommunityIcons"  style={{fontSize:25, color:'#000000'}} /> 
             </TouchableOpacity>
            </ScrollView>

             <Modal animationType = {"slide"} 
                    transparent = {true}
                    visible = {this.state.intentModal}
                    onRequestClose = {() => this.setState({intentModal:false})}>
               
                <View  style = {styles.modal}>
                  <View style={styles.modalView1}>
                   <Text style={{color:"#000", fontFamily: "Lato-Semibold"}}>Generate Intent</Text>
                   <RadioGroup 
                      size={24} 
                      thickness={2}
                      color='#232f3e'
                      selectedIndex={(this.state.intent=="Y")?0:1}
                      onSelect = {(index, value) => this.setState({intent:value})}
                     >
                      <RadioButton value={'Y'} >
                        <Text>Yes</Text> 
                      </RadioButton>
               
                      <RadioButton value={'N'}>
                        <Text>No</Text>
                      </RadioButton>
               
                    </RadioGroup>
                     {(this.state.isRefreshing==true)?
                      <ActivityIndicator size="small" color="#000000" style={{textAlign:"center"}}/>:  
                     <View style={{marginTop:15, flexDirection:'row', justifyContent:'space-around', marginTop:15, marginHorizontal:10}}>
                      <TouchableOpacity activeOpacity={.5}  onPress={() => this.setState({intentModal:false})}  style={styles.button}>
                        <Text selectable={true} style={styles.btnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity activeOpacity={.5}  onPress={() => this.updateIntent()} style={styles.button}>
                        <Text selectable={true} style={styles.btnText}>Submit</Text>
                      </TouchableOpacity>  
                    </View> 
                    }  
                    
                  </View>
                </View>
          </Modal> 


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
      fontSize:width*0.05, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center"
    },
button: {
     elevation:8, width:'45%', justifyContent:'center', alignItems:'center', backgroundColor:'#8db301', paddingVertical:height*0.01, borderRadius:25, marginTop:10
   },
btnText:{
    fontSize:width*0.04, fontFamily: "Lato-Semibold", color:'#FFFFFF'
   },
modal: {
      flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:'#00000080'
   },
modalView1:{
     width: '85%',backgroundColor:'#ffffff', borderRadius:10, justifyContent:'center', padding:15 
   },  
  })
