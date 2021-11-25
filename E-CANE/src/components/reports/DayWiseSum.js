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


export default class DayWiseSum extends Component {
   constructor(props) {
    super(props);
    this.state = {  
      language:"English",
      userData:{},
      dayWiseSum:[],
      loading:true,
      Date:new Date(),
      selected:7
   }
      global.DayWiseSum = this;
    }
  static navigationOptions =  ({ navigation }) => {
    return {  
        header:null  
   }        
  };

   componentDidMount(){
       this.retriveData()
       this.getDayWiseSummary()
     
      setInterval( () => {
         this.getDayWiseSummary()
      },60000)
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


   onValueChange(value: string) {
     global.DayWiseSum.setState({
       selected: value 
     }, ()=>{ global.DayWiseSum.getDayWiseSummary()});
   } 



   getDayWiseSummary(){
       
    this.setState({dayWiseSum:[], loading:true})  

    let date = dateFormat(this.state.Date, "yyyy-mm-dd"); 

      APIManager.getDayWiseSummary(date,  this.state.selected, 
        (responseJson)=> {
         console.log("day wise summary", JSON.stringify(responseJson));
        if(responseJson.data.status=='SUCCESS'){
          this.setState({dayWiseSum:responseJson.data.data, loading:false})  
         }    
       }, (error)=>{
         console.log(JSON.stringify(error));
       })      
       
   } 


  onRefresh(){
     this.getDayWiseSummary()
    }




  render() {
    return (
   
       <ScrollView style={{paddingHorizontal:5}} refreshControl={ <RefreshControl  refreshing={this.state.loading}
                                                    onRefresh={this.onRefresh.bind(this)}
                                                                      />  }>
          <Card style={{borderRadius:5, padding:10}}>  
                 
                 <View style={{backgroundColor:'#FF7F00', flexDirection:'row', padding:10,  justifyContent:'space-between'}}>
                  <Text style={{fontSize:15, fontFamily: "Lato-Black", color:'#ffffff'}}>Day Wise Summary</Text> 

                   <Form style={{backgroundColor:'#ffffff', borderRadius:5}}>
                      <Picker
                        note 
                        placeholder="Select Days"
                        placeholderIconColor="#007aff"
                        placeholderStyle={{ color: "#bfc6ea", fontSize:12 }}
                        textStyle={{ color: "#5cb85c" }} 
                        iosHeader="Select Days"
                        mode="dropdown"
                        style={{ width: 100, height:30}}
                        selectedValue={global.DayWiseSum.state.selected}
                        onValueChange={this.onValueChange.bind(this)}
                      >  
                        <Picker.Item label="07 Days" value="7" />
                        <Picker.Item label="14 Days" value="14" />
                        <Picker.Item label="21 Days" value="21" />
                        <Picker.Item label="28 Days" value="28" />
                      </Picker>
                    </Form>  
                 </View>
                    
 
                  <View style={{flexDirection:'row', paddingVertical:10}}>
                   <View style={{width:'32%'}}>
                    <Text style={{fontFamily: "Lato-Black",color:'#FB7820'}}>Date</Text>
                   </View> 
                    
                   <View style={{width:'32%'}}>
                    <Text style={{textAlign:'center', fontFamily: "Lato-Black", color:'#FB7820'}}>Today</Text>
                   </View>    
               
                   <View style={{width:'32%'}}> 
                    <Text style={{textAlign:'right', fontFamily: "Lato-Black", color:'#FB7820'}}>Todate</Text>
                   </View>
                  </View>  
          
        
         {(this.state.dayWiseSum.length > 0)?
         <FlatList     
          data={this.state.dayWiseSum}   
          keyExtractor={item => item.index}  
          renderItem={({item, index}) =>          
               
                 
                  <View style={{flexDirection:'row'}}>
                   <View style={{width:'32%', paddingTop:10}}>
                    <Text style={{fontFamily: "Lato-Black",}}>{item.wsDate}</Text>
                   </View>  

                   <View style={{width:'32%', paddingTop:10}}>  
                    <Text style={{textAlign:'center'}}>{item.onDateTotNetWeight}</Text>
                   </View>
      
                  <View style={{width:'32%', paddingTop:10}}>
                    <Text style={{textAlign:'right'}}>{item.asonTotNetWeight}</Text>
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
            