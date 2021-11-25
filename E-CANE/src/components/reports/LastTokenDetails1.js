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


export default class LastTokenDetails1 extends Component {
   constructor(props) {
    super(props);
    this.state = {  
      language:"English",
      userData:{},
      data:[]
   }
      global.LastTokenDetails1 = this;
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
       this.getLastTokenGrossData()
    
      setInterval( () => {
         this.getLastTokenGrossData()
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


  getLastTokenGrossData(){
    this.setState({data:[], loading:true})
       setTimeout(()=>{
        if(this.state.loading == true){
         Alert.alert("Unable to connect with server", "Try to switch the Network");
         this.setState({loading:false})
       }
      }, 10000)
      APIManager.getLastTokenGrossData((responseJson)=> {
        this.setState({loading:false})
         if(responseJson.data.status=='SUCCESS'){
           responseJson.data.data = JSON.parse(decrypt(responseJson.data.data.content));
           console.log("Last Token Details " + JSON.stringify(responseJson.data));
           this.setState({data:responseJson.data.data})

         }    
       },(error)=>{
         this.setState({loading:false})
        console.log(JSON.stringify(error));
       })
      
   }


  onRefresh(){
     this.getLastTokenGrossData()
    }


  render() {
    return (
   
       <ScrollView style={{flex:1,paddingHorizontal:5}} refreshControl={ <RefreshControl  refreshing={this.state.loading}
                                                     onRefresh={this.onRefresh.bind(this)}
     
                                                                     />  }>

          <Card style={styles.cardStyle}> 
           {(this.state.data.length > 0)?
             <View> 
              {this.state.data.map((item, index)=>

                <View style={{paddingHorizontal:10, paddingVertical:(Math.round(height)>705)?5:6, backgroundColor:(index%2)?'#CEE196':"#ffffff"}}>

                   <View style={{flexDirection:"row"}}> 
                    <Text style={{ fontSize:14, fontFamily: "Lato-Black"}}>{item.stage}</Text>
                     <Text style={{ fontSize:14, fontFamily: "Lato-Semibold"}}> (Counter No. : {item.counter_no})</Text>              
                   </View>
                   
    
                  <View style={{flexDirection:"row", marginTop:5}}>
                    <View style={{width:"25%"}}> 
                     <Text style={[styles.textStyle, {textAlign:"left"}]}>Token No.</Text> 
                    </View>
                    <View style={{width:"75%"}}>
                     <Text style={[styles.textStyle, {textAlign:"right"}]}>{item.swtm_tk_slip_no}</Text>
                    </View>
                  </View>

                  <View style={{flexDirection:"row",  marginTop:5}}>
                    <View style={{width:"25%"}}> 
                     <Text style={[styles.textStyle, {textAlign:"left"}]}>Time</Text> 
                    </View> 
                    <View style={{width:"75%"}}>
                     <Text style={[styles.textStyle, {textAlign:"right"}]}>{item.lastuseddate}</Text>
                    </View>
                  </View>
                  
                  <View style={{flexDirection:"row", marginTop:5}}>
                    <View style={{width:"25%"}}>
                     <Text style={[styles.textStyle, {textAlign:"left"}]}>Farmer</Text> 
                    </View>
                    <View style={{width:"75%"}}>
                     <Text style={[styles.textStyle, {textAlign:"right"}]}>{item.FarmerDisplayname.trim()}</Text>
                    </View>
                  </View>
                  
                  <View style={{flexDirection:"row",  marginTop:5}}>
                    <View style={{width:"25%"}}>
                     <Text style={[styles.textStyle, {textAlign:"left"}]}>Village</Text> 
                    </View>
                    <View style={{width:"75%"}}>
                     <Text style={[styles.textStyle, {textAlign:"right"}]}>{item.VillageDisplayName.trim()}</Text>
                    </View>
                  </View> 
                </View>
            
            )}
            </View>:
            <View style={styles.noDataView}>                            
               <Text style={styles.noDataText}>No Data Found</Text>
             </View>}
          </Card>
   </ScrollView>

    );
  }
}

const styles = StyleSheet.create({
 header: {
    elevation:5, height:50, backgroundColor:"#8db301", flexDirection:"row", alignItems:"center", paddingHorizontal:15, justifyContent:"space-between"
  },
  cardStyle:{
   marginHorizontal:10, borderRadius:5
  },
  textStyle: {
    fontSize:14, fontFamily: "Lato-Semibold"
  },
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
            