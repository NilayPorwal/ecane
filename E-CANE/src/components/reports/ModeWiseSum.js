import React, { Component } from 'react';
import { SafeAreaView, Text, View, Image, ScrollView, BackHandler, StyleSheet, 
         FlatList, TouchableOpacity, Dimensions, Alert, RefreshControl } from 'react-native';
import { Container, Header, Left, Body, Right, Button, Title,  Content,Segment, 
         Card, CardItem, Accordion, DatePicker, Footer, FooterTab, Badge, Form, Picker} from 'native-base';         
import { encrypt, decrypt } from "./../AESEncryption"
import APIManager from './../APIManager';
import I18n, { getLanguages } from 'react-native-i18n';
import { Icon } from 'native-base';
var base64 = require('base-64');  
import axios from 'axios';
var dateFormat = require('dateformat');
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Storage from 'react-native-storage';

const {height, width} = Dimensions.get('window');
var now = new Date();


export default class ModeWiseSum extends Component {
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
      crushingData:[]
   }
      global.ModeWiseSum = this;
    }
  static navigationOptions =  ({ navigation }) => {
    return {  
        header:null  
   }        
  };

 async componentDidMount(){
      if(APIManager.isDev != true){ 
       await APIManager.setHost()
      }
       this.retriveData()
       this.getCrushingReport()
       this.getModeWiseReport()
       setInterval( () => {
        this.setState({
          curTime : new Date().toLocaleTimeString()
        })
      },1000)

      setInterval( () => {
         this.getCrushingReport()
         this.getModeWiseReport()
      },300000)
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
  }


  getCrushingReport(){
    this.setState({crushingData:[], loading:true})
     setTimeout(()=>{
      if(this.state.loading == true){
       Alert.alert("Unable to connect with server", "Try to switch the Network");
       this.setState({loading:false})
     }
    }, 10000)
    APIManager.getCrushingReport((responseJson)=> {
        this.setState({loading:false})
         if(responseJson.data.status=='SUCCESS'){
           responseJson.data.data = JSON.parse(decrypt(responseJson.data.data.content));
           console.log("Crushing Report " + JSON.stringify(responseJson.data));
           this.setState({crushingData:responseJson.data.data})

         }    
       },(error)=>{
         this.setState({loading:false})
         console.log(JSON.stringify(error));
       })
      
   }

   getModeWiseReport(){
      this.setState({modeWiseSum:[]})
      APIManager.getModeWiseReport((responseJson)=> {
     // alert(JSON.stringify(responseJson));
        this.setState({loading:false})
         if(responseJson.data.status=='SUCCESS'){
           responseJson.data.data = JSON.parse(decrypt(responseJson.data.data.content));
           console.log("ModeWise Report " + JSON.stringify(responseJson.data));
           this.setState({modeWiseSum:responseJson.data.data})

         }    
       }, (error)=>{
         this.setState({loading:false})
         console.log(JSON.stringify(error));
       })     
      
   } 

  onRefresh(){
     this.getCrushingReport()
     this.getModeWiseReport()
    }




  render() {
    return (
   
       <ScrollView style={{flex:1}} refreshControl={ <RefreshControl  refreshing={this.state.loading}
                                                     onRefresh={this.onRefresh.bind(this)}
                                                                      />  }>
          <View style={{backgroundColor:'#8db301', paddingHorizontal:15, paddingVertical:10, flexDirection:"row"}}>
            <View style={{width:"60%"}}>
             <Text style={{color:"#ffffff", fontSize:15, fontFamily:"Lato-Semibold"}}>{this.state.userData.displayName}</Text>
            </View> 
            <View style={{width:"40%"}}>
             <Text style={{color:"#ffffff", fontSize:15, fontFamily:"Lato-Semibold", textAlign:"right"}}>{this.state.userData.mobile}</Text>
            </View> 
          </View>
         
        <View style={{paddingHorizontal:5}}> 
         <Card style={styles.cardStyle}> 
             <View style={{backgroundColor:"#FF7F00", marginHorizontal:15, marginTop:-20}}>
              <Text style={{fontSize:13, fontFamily: "Lato-Black", textAlign:"center", padding:10, color:"#FFFFFF"}}>CRUSHING</Text>
             </View>
            
           {(this.state.crushingData.length > 0)?
            <View> 
             <View style={[styles.tableView, {backgroundColor:'#ffffff',marginTop:10}]}>
                <Text style={styles.textStyle}>{dateFormat(now, "mmm dd, yyyy")}</Text>
                <Text style={styles.textStyle}>{this.state.curTime}</Text>
              </View>

             <View style={[styles.tableView, {backgroundColor:'#f86c6b'}]}>
                  <Text style={styles.textStyle}>Current Hour</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_CUR_HRS}</Text>
              </View>
    
             <View style={[styles.tableView, {backgroundColor:'#ffffff',}]}>
                  <Text style={styles.textStyle}>Last Hour</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_LAST_HRS}</Text>
              </View>

              <View style={[styles.tableView, {backgroundColor:'#CEE196',}]}>
                  <Text style={styles.textStyle}>Previous Day</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_PREVDAY}</Text>
              </View>
               
              <View style={[styles.tableView, {backgroundColor:'#f86c6b', borderBottomWidth: StyleSheet.hairlineWidth}]}>
                  <Text style={styles.textStyle}>Today</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_TODAY}</Text>
              </View>
           
              <View style={[styles.tableView, {backgroundColor:'#f86c6b'}]}>
                  <Text style={styles.textStyle}>Todate</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CURSH_TILLDATE}</Text>
              </View>
       
            
              <View style={[styles.tableView, {backgroundColor:'#ffffff',}]}>
                  <Text style={styles.textStyle}>Crushing Speed</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_SPEED}</Text>
              </View>

               <View style={[styles.tableView, {backgroundColor:'#CEE196',}]}>
                  <Text style={styles.textStyle}>Expected Crushing</Text>
                  <Text style={styles.textStyle}>{this.state.crushingData[0].CRUSH_EXPEC_24HRS}</Text>
              </View>
             </View>:
              <View style={styles.noDataView}>                            
               <Text style={styles.noDataText}>No Data Found</Text>
             </View>}

           </Card>

          <Card style={styles.cardStyle}> 
            <View style={{backgroundColor:"#FF7F00", marginHorizontal:15, marginTop:-20}}>
              <Text style={{fontSize:13, fontFamily: "Lato-Black", textAlign:"center", padding:10, color:"#FFFFFF"}}>YARD BALANCE</Text>
             </View>
            
            {(this.state.modeWiseSum.length > 0)?
             <View> 
              {this.state.modeWiseSum.map((item, index)=>

                <View style={{flexDirection:'row', paddingHorizontal:10, paddingVertical:(Math.round(height)>705)?5:6, backgroundColor:(index == (this.state.modeWiseSum.length-1))?"#f86c6b":(index%2)?'#CEE196':"#ffffff", }}>

                   <View style={{width:"40%"}}> 
                    <Text style={[styles.textStyle, {textAlign:"left"}]}>{item.M_NAME}</Text>
                   </View>
                   <View style={{width:"20%"}}> 
                    <Text style={[styles.textStyle, {textAlign:"center"}]}>{item.TOT_TOKEN}</Text>
                   </View> 
                  <View style={{width:"40%"}}> 
                    <Text style={[styles.textStyle, {textAlign:"right"}]}>{item.AVG_TK_YARD_BAL}</Text>
                  </View>  
                </View>
            
            )}
            </View>:
            <View style={styles.noDataView}>                            
               <Text style={styles.noDataText}>No Data Found</Text>
             </View>}
          </Card>
 
    </View>
   </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
 header: {
    elevation:5, height:50, backgroundColor:"#8db301", flexDirection:"row", alignItems:"center", paddingHorizontal:15, justifyContent:"space-between"
  },
  cardStyle:{
   marginHorizontal:10, marginTop:25, borderRadius:5
  },
  textStyle:{fontSize:14, fontFamily: "Lato-Semibold"},
 
  noDataView:{
    alignItems:"center", justifyContent:"center", height:height*0.2
  },
  noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  },
  tableView:{
    flexDirection:'row', justifyContent:'space-between', paddingHorizontal:10, paddingVertical:(Math.round(height)>705)?7:6
  }

});
            