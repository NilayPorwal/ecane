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


export default class HourlySum extends Component {
   constructor(props) {
    super(props);
    this.state = {  
      language:"English",
      userData:{},
      dayWiseSum:[],
      loading:true,
      Date:new Date(),
      selected:7,
      hourlyTareSum:[]
   }
      global.HourlySum = this;
    }
  static navigationOptions =  ({ navigation }) => {
    return {  
        header:null  
   }        
  };

   componentDidMount(){
       this.retriveData()
       this.getLiveTareSummary()

  }
 
 getLiveTareSummary(){
     

    let date = dateFormat(now, "yyyy-mm-dd"); 
    this.setState({hourlyTareSum:[], loading:true})

    APIManager.getTareSummary(date, 
        (response)=> {
          this.setState({loading:false})
        console.log("Live tare Summary" + JSON.stringify(response));
        const responseJson = response.data
        if(responseJson.status=='SUCCESS'){
       
       const hourlyTareSum = [
      
              {"hour":"08-09 AM", "pHTwt":responseJson.data[0].pH8Twt,  "pHTcwt":responseJson.data[0].pH8Tcwt},
              {"hour":"09-10 AM", "pHTwt":responseJson.data[0].pH9Twt,  "pHTcwt":responseJson.data[0].pH9Tcwt},
              {"hour":"10-11 AM", "pHTwt":responseJson.data[0].pH10Twt, "pHTcwt":responseJson.data[0].pH10Tcwt},
              {"hour":"11-12 PM", "pHTwt":responseJson.data[0].pH11Twt, "pHTcwt":responseJson.data[0].pH11Tcwt},
              {"hour":"12-01 PM", "pHTwt":responseJson.data[0].pH12Twt, "pHTcwt":responseJson.data[0].pH12Tcwt},
              {"hour":"01-02 PM", "pHTwt":responseJson.data[0].pH13Twt, "pHTcwt":responseJson.data[0].pH13Tcwt}, 
              {"hour":"02-03 PM", "pHTwt":responseJson.data[0].pH14Twt, "pHTcwt":responseJson.data[0].pH14Tcwt},            
              {"hour":"03-04 PM", "pHTwt":responseJson.data[0].pH15Twt, "pHTcwt":responseJson.data[0].pH15Tcwt}, 
              {"hour":"04-05 PM", "pHTwt":responseJson.data[0].pH16Twt, "pHTcwt":responseJson.data[0].pH16Tcwt}, 
              {"hour":"05-06 PM", "pHTwt":responseJson.data[0].pH17Twt, "pHTcwt":responseJson.data[0].pH17Tcwt}, 
              {"hour":"06-07 PM", "pHTwt":responseJson.data[0].pH18Twt, "pHTcwt":responseJson.data[0].pH18Tcwt}, 
              {"hour":"07-08 PM", "pHTwt":responseJson.data[0].pH19Twt, "pHTcwt":responseJson.data[0].pH19Tcwt}, 
              {"hour":"08-09 PM", "pHTwt":responseJson.data[0].pH20Twt, "pHTcwt":responseJson.data[0].pH20Tcwt}, 
              {"hour":"09-10 PM", "pHTwt":responseJson.data[0].pH21Twt, "pHTcwt":responseJson.data[0].pH21Tcwt}, 
              {"hour":"10-11 PM", "pHTwt":responseJson.data[0].pH22Twt, "pHTcwt":responseJson.data[0].pH22Tcwt}, 
              {"hour":"11-12 PM", "pHTwt":responseJson.data[0].pH23Twt, "pHTcwt":responseJson.data[0].pH23Tcwt},
              {"hour":"12-01 AM", "pHTwt":responseJson.data[0].pH0Twt,  "pHTcwt":responseJson.data[0].pH0Tcwt},
              {"hour":"01-02 AM", "pHTwt":responseJson.data[0].pH1Twt,  "pHTcwt":responseJson.data[0].pH1Tcwt},
              {"hour":"02-03 AM", "pHTwt":responseJson.data[0].pH2Twt,  "pHTcwt":responseJson.data[0].pH2Tcwt},
              {"hour":"03-04 AM", "pHTwt":responseJson.data[0].pH3Twt,  "pHTcwt":responseJson.data[0].pH3Tcwt},
              {"hour":"04-05 AM", "pHTwt":responseJson.data[0].pH4Twt,  "pHTcwt":responseJson.data[0].pH4Tcwt},
              {"hour":"05-06 AM", "pHTwt":responseJson.data[0].pH5Twt,  "pHTcwt":responseJson.data[0].pH5Tcwt},
              {"hour":"06-07 AM", "pHTwt":responseJson.data[0].pH6Twt,  "pHTcwt":responseJson.data[0].pH6Tcwt},
              {"hour":"07-08 AM", "pHTwt":responseJson.data[0].pH7Twt,  "pHTcwt":responseJson.data[0].pH7Tcwt},
        
         ]
         this.setState({hourlyTareSum})

      }  
     }, (error)=>{
         console.log(JSON.stringify(error));
         this.setState({loading:false})
       })
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


  onRefresh(){
     this.getLiveTareSummary()
    }



  render() {
    return (
   
       <ScrollView style={{paddingHorizontal:5}} refreshControl={ <RefreshControl  refreshing={this.state.loading}
                                                    onRefresh={this.onRefresh.bind(this)}
                                                                      />  }>
          <Card style={{borderRadius:5, padding:10}}>  
                 
                 <View style={{backgroundColor:'#FF7F00', flexDirection:'row', padding:10,  justifyContent:'space-between'}}>
                  <Text style={{fontSize:15, fontFamily: "Lato-Black", color:'#ffffff'}}>Hourly Tare Summary</Text> 
                 </View>
                    
                  <View style={{flexDirection:'row', paddingTop:10}}>
                   <View style={{width:'32%'}}>
                    <Text style={{fontFamily: "Lato-Black",color:'#FB7820'}}>Time</Text>
                   </View> 
                    
                   <View style={{width:'32%'}}>
                    <Text style={{textAlign:'center', fontFamily: "Lato-Black", color:'#FB7820'}}>Count</Text>
                   </View>    
               
                   <View style={{width:'32%'}}> 
                    <Text style={{textAlign:'right', fontFamily: "Lato-Black", color:'#FB7820'}}>Weight</Text>
                   </View>
                  </View>  
          
        
         {(this.state.hourlyTareSum.length > 0)?
         <FlatList     
          data={this.state.hourlyTareSum}   
          keyExtractor={item => item.index}  
          renderItem={({item, index}) =>          
               
                 
                  <View style={{flexDirection:'row'}}>
                   <View style={{width:'32%', paddingTop:10}}>
                    <Text style={{fontFamily: "Lato-Black",}}>{item.hour}</Text>
                   </View>  

                   <View style={{width:'32%', paddingTop:10}}>  
                    <Text style={{textAlign:'center'}}>{item.pHTcwt}</Text>
                   </View>
      
                  <View style={{width:'32%', paddingTop:10}}>
                    <Text style={{textAlign:'right'}}>{item.pHTwt}</Text>
                  </View>
                </View> 
           
    
            }  
       />: <View style={styles.noDataView}>                            
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
   marginHorizontal:10, marginTop:40,  elevation:8, backgroundColor:'#ffffff', borderRadius:5
  },
  textStyle:{fontSize:15, fontFamily: "Lato-Semibold"},
 
  noDataView:{
    alignItems:"center", justifyContent:"center", height:height*0.2
  },
  noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  },

});
            