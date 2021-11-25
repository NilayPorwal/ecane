import React, {Component} from 'react';
import {Platform, StyleSheet,  View, Dimensions, processColor, FlatList, ScrollView, TouchableOpacity,Animated} from 'react-native';
import base64 from 'react-native-base64'
import { Container, Header, Left, Body, Right, Button, Icon, Title,  Content,Segment, 
         Card, CardItem, Text, Accordion, DatePicker, Footer, FooterTab, Badge, Spinner} from 'native-base';

import {LineChart, PieChart, BarChart} from 'react-native-charts-wrapper';
import APIManager from './Managers/APIManager';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';

var dateFormat = require('dateformat');
const {width, height} = Dimensions.get('window')


global.LiveDataScreen;
export default class LiveDataScreen extends Component {
   constructor(props) {  
       super(props);     
      this.state = {       
         Date:new Date(),
      tableHead: ['Vehicle Type', 'Count\n(Token)', 'Weight\n(Token)', 'Count\n(Gross)', 'Weight\n(Gross)'],
      tableHead1: ['Hours',  'Weight', 'Count',],
      tableTitle1: [ '08-09 AM', '09-10 AM', '10-11 AM', '11AM-12PM', '12-01 PM', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM', '05-06 PM', '06-07 PM', '07-08 PM',
                     '08-09 PM', '09-10 PM', '10-11 PM', '11PM-12AM', '12-01 AM', '01-02 AM', '02-03 AM', '03-04 AM', '04-05 AM', '05-06 AM', '06-07 AM', '07-08 AM','TOTAL'],
     }
      this.animatedValue = new Animated.Value(0);
 
      this.value = 0;
      
      this.animatedValue.addListener(({ value }) => {
 
        this.value = value;
 
      })                      
   }  

    static navigationOptions = {
       header: null,
            
   }; 

   componentDidMount(){
      setInterval( () => {
      this.flip_Card_Animation()
    },300000)
      //this.flip_Card_Animation()
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
   


  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
    const data = [1, 2, 3, 4, 5];
    return (  
  (this.props.loading == false)?  
      <ScrollView style={{flex:1, paddingHorizontal:5}}>

       <Animated.View style={[Rotate_Y_AnimatedStyle, {flexDirection:'row', justifyContent:'space-between'}]}>
       
        <Card style={{width:"48%", backgroundColor:'#f86c6b',  margin:10,  borderRadius:3, height:height*0.12, paddingHorizontal:15, justifyContent:'center'}}>
           <View style={{flexDirection:'row'}}> 
            <Icon type="FontAwesome" name="industry" style={{fontSize: 18, color: '#ffffff'}} /> 
            <Text style={{fontFamily: "Lato-Black", color:'#ffffff',fontSize:width*0.04, paddingLeft:5 }}>Yard Balance</Text>
           </View>  
           <Text style={{color:'#ffffff', fontFamily: "Lato-Black", fontSize:width*0.05, textAlign:"center"}}>{this.props.liveYardBalance}</Text>  
        </Card>
      
         <Card style={{width:"48%", backgroundColor:'#ffc107',margin:10,  borderRadius:3, height:height*0.12, paddingHorizontal:15, justifyContent:'center'}}> 
         <View style={{flexDirection:'row'}}> 
          <Icon type="FontAwesome" name="gavel" style={{fontSize: 18, color: '#ffffff'}} />
          <Text  style={{fontFamily: "Lato-Black", color:'#ffffff', fontSize:width*0.04, paddingLeft:5}}>Today's Crushing</Text>
         </View> 
         <Text style={{color:'#ffffff', fontFamily: "Lato-Black", fontSize:width*0.05, textAlign:"center"}}>{this.props.liveCrushingWeight}</Text>  
         </Card>       
        
        </Animated.View>
          
          <Animated.View style={[Rotate_Y_AnimatedStyle]}>   
         <Card style={{backgroundColor:'#4dbd74',  margin:10,  borderRadius:3,  height:height*0.12, paddingHorizontal:15, justifyContent:'center'}}>    
          <View style={{flexDirection:'row', justifyContent:'space-between'}}> 
          <View style={{flexDirection:'row'}}> 
           <Icon type="FontAwesome" name="balance-scale" style={{fontSize: 18, color: '#ffffff', padding:7}} />
           <Text style={{fontFamily: "Lato-Black", color:'#ffffff', fontSize:width*0.05}}>Total Weight</Text>
          </View> 
           <Text style={{color:'#ffffff', fontFamily: "Lato-Black", fontSize:width*0.05}}>{this.props.liveTotalWeight}</Text>  
          </View>
         </Card>
         </Animated.View>

         <Animated.View style={[Rotate_Y_AnimatedStyle]}>
          <Card>
          {(this.props.lastTokenData.length > 0)?
            <View style={styles.row}>
              <View style={{width:"30%"}}> 
                 <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>Slip (Counter)</Text>
                 <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.props.lastTokenData[0].activity} ({this.props.lastTokenData[0].counter_no})</Text>
               </View>

               <View style={{width:"30%", alignItems:"flex-start"}}> 
                <Text style={{fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>Current Slip No</Text>
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.props.lastTokenData[0].swtm_tk_slip_no}</Text>
               </View>
              
               <View style={{width:"40%", alignItems:"center"}}> 
                <Text style={{fontSize: width*0.035, fontFamily:'Lato-Semibold', color: "#000000",}}>Date</Text>
                <Text style={{ fontSize: width*0.035, fontFamily:'Lato-Black', color: "#000000",}}>{this.props.lastTokenData[0].lastuseddate}</Text>
               </View>
            </View>:null} 
           <TouchableOpacity onPress={()=>this.props.navigate("LastTokenDetails")}>
            <Text style={{color:"#3473c3", fontSize:width*0.04, fontFamily:"Lato-Semibold", textAlign:"center", padding:10}}>Show Current Token Activity</Text>
           </TouchableOpacity> 
          </Card>
         </Animated.View>

        <Animated.View style={[Rotate_Y_AnimatedStyle]}>
           <Card> 
             <View style={{backgroundColor:"#FF7F00", margin:10}}>
              <Text style={{fontSize:15, fontFamily: "Lato-Black", textAlign:"center", padding:10, color:"#FFFFFF"}}>Crushing</Text>
             </View>
             {(this.props.crushingData.length > 0)?
            <View> 
          
             <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#CEE196'}}>
                  <Text style={styles.textStyle}>Current Hour</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_CUR_HRS}</Text>
              </View>
    
             <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#ffffff',}}>
                  <Text style={styles.textStyle}>Last Hour</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_LAST_HRS}</Text>
              </View>

              <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#CEE196',}}>
                  <Text style={styles.textStyle}>Previous Day</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_PREVDAY}</Text>
              </View>
               
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#ffffff',}}>
                  <Text style={styles.textStyle}>Today</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_TODAY}</Text>
              </View>
           
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#CEE196'}}>
                  <Text style={styles.textStyle}>Todate</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CURSH_TILLDATE}</Text>
              </View>
       
            
              <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#ffffff',}}>
                  <Text style={styles.textStyle}>Crushing Speed</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_SPEED}</Text>
              </View>

               <View style={{flexDirection:'row', justifyContent:'space-between', padding:10, backgroundColor:'#CEE196',}}>
                  <Text style={styles.textStyle}>Expected Crushing</Text>
                  <Text style={styles.textStyle}>{this.props.crushingData[0].CRUSH_EXPEC_24HRS}</Text>
              </View>
             </View>:
              <View style={styles.noDataView}>                            
               <Text style={styles.noDataText}>No Data Found</Text>
             </View>}
          </Card>
          </Animated.View>
   
      <Animated.View style={[Rotate_Y_AnimatedStyle]}>
        <Card style={{marginTop:15,  backgroundColor:'#f1f8ff'}}> 
         <View style={{backgroundColor:'#FF7F00', marginVertical:10, marginHorizontal:5}}>
          <Text style={{fontSize:15, fontFamily: "Lato-Black",  padding:10, color:'#ffffff', textAlign:'center'}}>Mode Wise Summary </Text> 
         </View>

         {(this.props.tableData.length>0)?
         <Table>
          <Row data={this.state.tableHead} flexArr={[1, 1, 1, 1, 1]} style={styles.head} textStyle={{textAlign: 'center', fontFamily: "Lato-Black", color:'#000000'}}/>
          
          <TableWrapper style={styles.wrapper}> 
            <Col data={this.props.tableTitle} style={styles.title} heightArr={[35, 35, 35, 35, 35, 35, 35, 35]} textStyle={{textAlign:'center',  color:'#000000'}}/>
            <Rows data={this.props.tableData} flexArr={[1, 1, 1, 1]} style={{ height: 35 }} textStyle={styles.text}/>
          </TableWrapper>
        </Table>: 
          <View style={styles.noDataView}>                            
              <Text style={styles.noDataText}>No Data Found</Text>
           </View>} 
       </Card>
      </Animated.View>
         

       <Card style={{marginTop:15, backgroundColor:'#f1f8ff'}}> 
         <View style={{backgroundColor:'#FF7F00', marginVertical:10, marginHorizontal:5}}>
          <Text style={{fontSize:15, fontFamily: "Lato-Black",  padding:10, color:'#ffffff', textAlign:'center'}}>Hourely Tare Summary </Text> 
         </View>

        {(this.props.tableData1.length>0)?
         <Table>
          <Row data={this.state.tableHead1} flexArr={[1, 1, 1]} style={styles.head} textStyle={{textAlign: 'center', fontFamily: "Lato-Black", color:'#000000'}}/>
          
          <TableWrapper style={styles.wrapper}> 
            <Col data={this.state.tableTitle1} style={styles.title} heightArr={[35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35]} textStyle={{textAlign:'center',  color:'#000000'}}/>
            <Rows data={this.props.tableData1} flexArr={[1, 1]} style={{ height: 35 }} textStyle={styles.text}/>
          </TableWrapper>
        </Table>: 
          <View style={styles.noDataView}>                            
              <Text style={styles.noDataText}>No Data Found</Text>
           </View>} 
       </Card>
    
    </ScrollView>: 
      <Spinner color='blue' />
    
    );     
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20, textAlign: 'center',margin: 10,
  },
  instructions: {
    textAlign: 'center',color: '#333333',marginBottom: 5,
  },
   textStyle:{
    fontSize:14, fontFamily: "Lato-Semibold"
   },
   head: {  
    height: 40,  backgroundColor: '#f1f8ff' 
   },
   wrapper: { 
    flexDirection: 'row' 
   },
   title: { 
    flex: 1, backgroundColor: '#f1f8ff' 
   },
  row:{
    flexDirection: 'row', padding:10,backgroundColor: "#d8a800",
    },
   text: { 
    textAlign: 'center', paddingRight:5 
   },
   noDataView:{
    alignItems:"center", justifyContent:"center", height:height*0.2
   },
   noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  }


});
