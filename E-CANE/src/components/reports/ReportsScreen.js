import React, { Component } from 'react';
import { SafeAreaView, Text, View, Image, ScrollView, BackHandler, StyleSheet, Modal,
         FlatList, TouchableOpacity, Dimensions, Alert, RefreshControl } from 'react-native';
import { encrypt, decrypt } from "./../AESEncryption"
import APIManager from './../APIManager';
import I18n, { getLanguages } from 'react-native-i18n';
import { Icon } from 'native-base';
var base64 = require('base-64');  
import axios from 'axios';
var dateFormat = require('dateformat');
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Storage from 'react-native-storage';
import { Container, Header,Item,Input, Left, Body, Right, Button, Title,  Content, 
         Card, CardItem, Accordion, DatePicker, Footer, FooterTab} from 'native-base';
import ModeWiseSum from './ModeWiseSum'
import DayWiseSum from './DayWiseSum'
import HourlySum from './HourlySum'
import LastTokenDetails from './LastTokenDetails'
import LastTokenDetails1 from './LastTokenDetails1'

import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';

const {height, width} = Dimensions.get('window');
var now = new Date();

export default class ReportsScreen extends Component {
   constructor(props) {
    super(props);
    this.state = {  
      language:"English",
      userData:{},
      curTime:null,
      tareSummary:[],
      modeWiseSum:[],
      hourlyTareSum:[],
      curHrCr:null,
      lastHrCr:null,
      loading:true,
      selectedTab:'modeWise',
      hourlyTareSum1:[],
      netModal:false,
      selectedNet:0,
      host:[]

   }
      global.ReportsScreen = this;
    }
  static navigationOptions =  ({ navigation }) => {
    return {  
        header:null  
   }        
  };

   componentDidMount(){
       BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);    
       this.retriveData()
       // this.getIpAddress()
  }
 

  handleAndroidBackButton() {
      //BackHandler.exitApp(); 
      if(global.ReportsScreen.state.userData.roleName == "REPORT_VIEWER"){
        
          BackHandler.exitApp(); 
        }else{
          global.ReportsScreen.props.navigation.goBack();
        }
      //global.ReportsScreen.props.navigation.goBack();
       return true;
    }      
            
    
  componentWillUnmount() {
     BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
    
  }

 componentWillMount() {
    I18n.locale = this.state.language;
  } 

   retriveData(){
    APIManager.getValueForKey('userData', (data)=>{
     if(data != null){ 
        console.log("User Data " + JSON.stringify(data));
        this.setState({userData:data})
     }
    }, (error)=>{
         console.log("User Data " + JSON.stringify(error));
    })

    // APIManager.getValueForKey('networkType', (data)=>{
    //  if(data != null ){ 
    //   this.setState({selectedNet:data})
    //   this.getIpAddress(data)
    // }
    // },(error)=>{
    //      this.setState({netModal:!this.state.netModal})
    //      console.log("Network Type " + JSON.stringify(error));
    // })

 
  }

 
 logOutPress(){
    Alert.alert( 
      "Logout Confirmation",
      'Do you want to Logout ?',
      [
        { 
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Yes', onPress: () => this.logOut()},
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
          Alert.alert(response.message)
    
       } 
    },(error)=>{
       console.log("Logout Error " + JSON.stringify(error));

  })
   APIManager.removeValueForKey()
   this.setState({userData:{}})
   this.props.navigation.navigate("LoginScreen")
  
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

  renderSelectedTab () {
    switch (this.state.selectedTab) {
      case 'modeWise':
        return (<ModeWiseSum />);
        break;
      
      case 'hourly':
        return (<HourlySum hourlyTareSum = {this.state.hourlyTareSum1}/>);
        break;

       case 'token':
        return (<LastTokenDetails navigation={this.props.navigation} />);
        break;  

       case 'dayWise':
        return (<DayWiseSum />);
        break;     

      default:  
    }       
  }

async onRefresh(){
     if(APIManager.isDev != true){ 
       await APIManager.setHost()
      }

   if(this.state.selectedTab==='modeWise'){
       global.ModeWiseSum.onRefresh()
   
   }else if(this.state.selectedTab==='hourly'){
       global.HourlySum.onRefresh()
   
   }
    else if(this.state.selectedTab==='dayWise'){
       global.DayWiseSum.onRefresh()
    }
    else if(this.state.selectedTab==='token'){
       global.LastTokenDetails.onRefresh()
    }
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
          this.setState({netModal:false, selectedNet:value})
          this.onRefresh()
       } 

     }else if(value == 0){
       if(response.data.sky_MSPIL_ERP_API_HOST_LAN !== null){
          APIManager.setValueForKey('ipAddress', response.data.sky_MSPIL_ERP_API_HOST_LAN);
          APIManager.setValueForKey('networkType', "0");
          this.setState({netModal:false, selectedNet:value})
          this.onRefresh()
       }

    }
    }, (error)=>{
        this.setState({netModal:false, selectedNet:value})
        console.log(JSON.stringify(error))

    })
  
  }

  render() {
    return (
      <SafeAreaView style={{flex:1}}>
      <Container> 
          <View style={styles.header}>
               <Image
                    style={{width: "25%", height: "90%"}}
                   // resizeMode="contain"
                    source={require('./../../assets/logo_white.png')}
                  />
               <View style={{flexDirection:"row"}}>
                <TouchableOpacity onPress={()=>this.onRefresh()}>
                  <Icon type="FontAwesome"  name="refresh" style={{fontSize:22, paddingRight:10, color:'#ffffff'}} />
                </TouchableOpacity>         
                <Menu 
                  ref={this.setMenuRef}
                  button={<Icon  name='ellipsis-v' type="FontAwesome"     
                                 style={{fontSize:25, color:'#ffffff'}}
                                 onPress={this.showMenu} /> 
                 } >
                  <MenuItem onPress={() => this.logOutPress()}>Log Out</MenuItem>
                </Menu>
               </View> 
          </View> 

          <View style={{flex:1}} >
            {this.renderSelectedTab()}
          </View>  

        <Footer style={{}}>   
       
           <FooterTab style={{backgroundColor:'#ffffff'}}>
            <Button vertical  style={{backgroundColor:(this.state.selectedTab==='modeWise')?"#007ed6":"#f1f8ff"}} active={this.state.selectedTab==='modeWise'} onPress={() => this.setState({selectedTab: 'modeWise'})}>
              <Icon type="FontAwesome5"  name="tractor" style={{color:(this.state.selectedTab==='modeWise')?'#ffffff':"#000000", fontSize:15}} />
              <Text style={{color:(this.state.selectedTab==='modeWise')?'#ffffff':"#000000", fontSize:10}}>Mode Wise</Text>
            </Button>
            <Button vertical style={{backgroundColor:(this.state.selectedTab==='hourly')?"#007ed6":"#f1f8ff"}} active={this.state.selectedTab==='hourly'} onPress={() => this.setState({selectedTab: 'hourly'})}>
              <Icon type="Entypo" name="stopwatch" style={{color:(this.state.selectedTab==='hourly')?'#ffffff':"#000000", fontSize:15}}/>
              <Text style={{color:(this.state.selectedTab==='hourly')?'#ffffff':"#000000", fontSize:10}}>Hourly</Text>
            </Button>
            <Button vertical  style={{backgroundColor:(this.state.selectedTab==='token')?"#007ed6":"#f1f8ff"}} active={this.state.selectedTab==='token'} onPress={() => this.setState({selectedTab: 'token'})}>
              <Icon type="AntDesign" name="filetext1" style={{color:(this.state.selectedTab==='token')?'#ffffff':"#000000", fontSize:15}} />
              <Text style={{color:(this.state.selectedTab==='token')?'#ffffff':"#000000", fontSize:10}}>Last Token</Text>
            </Button>
            <Button vertical  style={{backgroundColor:(this.state.selectedTab==='dayWise')?"#007ed6":"#f1f8ff"}} active={this.state.selectedTab==='dayWise'} onPress={() => this.setState({selectedTab: 'dayWise'})}>
              <Icon type="FontAwesome" name="calendar" style={{color:(this.state.selectedTab==='dayWise')?'#ffffff':"#000000", fontSize:15}} />
              <Text style={{color:(this.state.selectedTab==='dayWise')?'#ffffff':"#000000", fontSize:10}}>Day Wise</Text>
            </Button>
    
          </FooterTab>
        </Footer>  

     </Container> 

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
     </SafeAreaView>

    );
  }
}

const styles = StyleSheet.create({
 header: {
    elevation:5, height:height*0.075, backgroundColor:"#8db301", flexDirection:"row", alignItems:"center", paddingHorizontal:15, justifyContent:"space-between"
  },
  cardStyle:{
   marginHorizontal:10, marginTop:40, borderRadius:5
  },
  textStyle:{fontSize:15, fontFamily: "Lato-Semibold"},
 
  noDataView:{
    alignItems:"center", justifyContent:"center", height:height*0.2
  },
  noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  },
  modal: {
      flex: 1,  justifyContent: 'center', alignItems: 'center',backgroundColor:'#00000080'
   },
  modalView1:{
     width: '85%',backgroundColor:'#ffffff', borderRadius:10, justifyContent:'center', padding:15 
   }, 

});
            