import React, { Component } from 'react';
import { Text, View, ScrollView, StyleSheet, FlatList, Animated, TouchableOpacity, Dimensions, processColor, BackHandler} from 'react-native';
import GroupBarChart from './../BarChart/GroupBarChart'
import { encrypt, decrypt } from "./../../AESEncryption"
import APIManager from './../../APIManager';
import { Icon, Card } from 'native-base';

var dateFormat = require('dateformat');
var now = new Date();

const notification = [
  {
    'icon' : 'http://bit.ly/2HVRSx8',
    'Name': 'Rajat Jain',
    'NotificationName':'You have 5 new task',
  },
  {
      'icon' : 'http://bit.ly/2HVRSx8',
      'Name': 'Shubham Pathak',
      'NotificationName':'You are now friend with Andrew',
  },
  {
      'icon' : 'http://bit.ly/2HVRSx8',
      'Name': 'Sumit Tiwari',
      'NotificationName':'Another Notification',
  },
  {
      'icon' : 'http://bit.ly/2HVRSx8',
      'Name': 'Mulayam Yadav',
      'NotificationName':'You have 5 new task',
  },
  {
      'icon' : 'http://bit.ly/2HVRSx8',
      'Name': 'Amit Tiwari',
      'NotificationName':'You are now friend with Andrew',
  },
  {
      'Name': 'Shivam Chauhan',
      'NotificationName':'Another Notification',
  },
  
 ]

 const {width, height} = Dimensions.get('window');


export default class WeighmentStats extends Component {
  constructor() {
    super();
    this.state = {
      legend: {
       textSize: 15,
       xEntrySpace: 40,
       fontFamily: "Lato-Semibold",  
       },
       xAxis: {
        granularityEnabled: true,
        granularity: 1,
        axisMaximum: 2,
        axisMinimum: 0,
        centerAxisLabels: false,
        drawLabels:false,
        drawAxisLine:false,
        drawGridLines:false
        
      },
       yAxis: {
        left: {
          axisMinimum: 0,
          drawLabels: false,
          drawAxisLine: false,
          drawGridLines: false,
          zeroLine: {
            enabled: true,
            lineWidth: 1.5
          }
        },
        right: {
          axisMinimum: 0,
          enabled: false
        }
      },
      marker: {
        enabled: false,
        markerColor: processColor('#8dd8a6'),
        textColor: processColor('#000'),
        markerFontSize: 18,
      },
     delayedVehicleCount:[],
     delayedVehcleList:[],
     yardBalance:[],
     burnCaneWeight:[]
     }
     global.WeighmentStats = this;
    } 

    componentDidMount(){
        // this.getDelayedVehicleCount();
        // this.getDelayedVehicleInYard();
        // this.getLiveTareSummary();
        // this.getYardBalance()
        // this.getBurnCaneWeight()
     // BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);    
    } 

  handleAndroidBackButton() {   
       global.WeighmentStats.props.navigation.goBack();
       return true;
    }      
            
    
  componentWillUnmount() {
     //BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);

    
   }

    getDelayedVehicleCount(){

    APIManager.getDelayedVehicleCount((response)=>{
        if(response.data.status == "SUCCESS"){
            const responseJson = JSON.parse(decrypt(response.data.data.content));
            console.log("Delayed Vehicle Count :" + JSON.stringify(responseJson));
            this.setState({delayedVehicleCount:responseJson})
          }
        else{
          // Alert.alert("Error in Average Time data", response.data.message)
             this.setState({isLoading:false})
          }
    }, (error)=>{
       this.setState({isLoading:false})
       // Alert.alert("Error in Average Timedata" + JSON.stringify(error.message));
       console.log("Error in Delayed Vehicle Count data" + JSON.stringify(error.message));
    })
  
}

   getLiveTareSummary(){ 

    //let date = dateFormat(now, "yyyy-mm-dd"); 
    let date = dateFormat(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), "yyyy-mm-dd")

    APIManager.getTareSummary(date, 
        (responseJson)=> {
      
      console.log("Live Tare Summary" + JSON.stringify(responseJson));
    
    }, (error)=>{
         this.setState({isLoading:false})
         // Alert.alert("Error in Average Timedata" + JSON.stringify(error.message));
         console.log("Error in Live Tare Summary" + JSON.stringify(error));
      })
  }


    getDelayedVehicleInYard(){

      APIManager.getDelayedVehicleInYard((response)=>{
          if(response.data.status == "SUCCESS"){
              const responseJson = JSON.parse(decrypt(response.data.data.content));
              console.log("Delayed Vehicle In Yard :" + JSON.stringify(responseJson));
              this.setState({delayedVehcleList:responseJson})
            }
            else{
            // Alert.alert("Error in Average Time data", response.data.message)
               this.setState({isLoading:false})
            }
      }, (error)=>{
         this.setState({isLoading:false})
         // Alert.alert("Error in Average Timedata" + JSON.stringify(error.message));
         console.log("Error in Delayed Vehicle In Yard data" + JSON.stringify(error.message));
      })
  
}

getYardBalance(){

      APIManager.getYardBalance((response)=>{
          if(response.data.status == "SUCCESS"){
              const responseJson = JSON.parse(decrypt(response.data.data.content));
              console.log("Yard Balance:" + JSON.stringify(responseJson));
              this.setState({yardBalance:responseJson})
            }
            else{
            // Alert.alert("Error in Average Time data", response.data.message)
               this.setState({isLoading:false})
            }
      }, (error)=>{
         this.setState({isLoading:false})
         // Alert.alert("Error in Average Timedata" + JSON.stringify(error.message));
         console.log("Error in Yard Balance data" + JSON.stringify(error));
      })
  
}

getBurnCaneWeight(){
  APIManager.getBurnCaneWeight((response)=>{
          if(response.data.status == "SUCCESS"){
              const responseJson = JSON.parse(decrypt(response.data.data.content));
              console.log("Burn Cane Weight:" + JSON.stringify(responseJson));
              this.setState({burnCaneWeight:responseJson})
            }
            else{
            // Alert.alert("Error in Average Time data", response.data.message)
               this.setState({isLoading:false})
            }
      }, (error)=>{
         this.setState({isLoading:false})
         // Alert.alert("Error in Average Timedata" + JSON.stringify(error.message));
         console.log("Error in Yard Balance data" + JSON.stringify(error));
      })
  
}

    renderItems = ({ item }) => {
      return (
          
         <ScrollView style={{flex:1,}}>
              <View style={{flexDirection:'row', padding:15,  }} >
                      <Icon type="FontAwesome5" name="circle" size={15} color="#E63D39" />
                      <Text selectable={true} style={{fontSize:16,  fontFamily: "Lato-Black", paddingLeft:10, marginTop:-5}}>{item.Name}</Text>      
              </View>
              <View>
                  <Text selectable={true} style={{paddingLeft:40, marginTop:-15, fontSize:14}}>{item.NotificationName}</Text>
              </View>
         </ScrollView>
          
      )
    }

       renderHeader(title){

        return <View style={{backgroundColor:"#E63D39", marginHorizontal:15, marginTop:-25}}>
                <Text selectable={true} style={{fontSize:15,  fontFamily: "Lato-Black", textAlign:"center", padding:10, color:"#FFFFFF"}}>{title}</Text>
               </View>
      } 


  render() {

    return (
      <View style={{ flex: 1, backgroundColor:'#F1F2F6',  paddingVertical:20,}}>
  
        <View style={{marginHorizontal:10, marginTop:20}}>
         <Card>
           {this.renderHeader("Burnt Cane Recd.")}
            <View style={{marginVertical:15, justifyContent:'center', alignItems:'center'}}>
                <Card style={{justifyContent:'center', alignItems:'center', paddingVertical:15, paddingHorizontal:25}}>
                   
                    <Text style={{fontSize:16}}>Today</Text>
                    <Text style={{fontSize:20, fontFamily: "Lato-Black"}}>{(this.props.burnCaneWeight.length > 0)?this.props.burnCaneWeight[0].burncanwt:0} (Qtl.)</Text>
                   
                </Card>
            </View>
           </Card> 
        </View>
      
        <View style={{marginHorizontal:10, marginTop:30, height:height*0.3}}>
        <Card>
        {this.renderHeader("Delayed Vehicle")}
        {(this.props.delayedVehicleCount.length>0)?  
       <GroupBarChart {...this.state}
                   value1 = {[parseInt(this.props.delayedVehicleCount[0].TokenGross)]} value2 = {[parseInt(this.props.delayedVehicleCount[0].GrossTare)]}
                   label1="Token → Gross" label2="Gross → Tare"
                   color1="#05D7EA"  color2="#FB3C46"
                   navigate={()=>this.props.navigate("SurveyorStats")}  />
        : <View style={styles.noDataView}>
                <Text style={styles.noDataText}>No Data Found</Text>
              </View> }
          </Card>    
       </View> 

         <View style={{marginHorizontal:10}}>
          <Card>
         {this.renderHeader("Delayed Vehicle In Yard")}
         
         <View style={{flexDirection:"row", justifyContent:"space-between", padding:10,  backgroundColor:"#C3EFF0", marginTop:10}}>
           <View style={{width:"28%", justifyContent:"center"}}> 
            <Text style={styles.tableText}>Delayed Between</Text>
           </View>
          <View style={{width:"72%"}}>
           <Text style={{textAlign:"center", fontSize:13, paddingBottom:2}}>Hours</Text>
           <View style={{flexDirection:"row"}}>
             <View style={{width:"25%", alignItems:"center"}}>  
              <Text style={styles.tableText}>0-8</Text>
             </View> 
             <View style={{width:"25%", alignItems:"center"}}>
              <Text style={styles.tableText}>8-16</Text>
             </View>
             <View style={{width:"25%", alignItems:"center"}}>
              <Text style={styles.tableText}>Above 16</Text>
             </View>
             <View style={{width:"25%", alignItems:"center"}}>  
              <Text style={styles.tableText}>Total</Text>
             </View>
           </View> 
          </View>  
         </View>
         {(this.props.delayedVehcleList.length > 0)?
          <FlatList    
            data={this.props.delayedVehcleList}
            keyExtractor={item => item.index} 
            renderItem={({item, index}) =>
             <View style={{flexDirection:"row", justifyContent:"space-between", padding:10}}>
              <View style={{width:"28%"}}>
              {(index == 0)?
                <Text style={styles.tableText}>TOKEN-GROSS</Text>:
                 <Text style={styles.tableText}>GROSS-TARE</Text>}
              </View>

              <View style={{width:"18%", alignItems:"center"}}>     
                <Text style={styles.tableText}>{item.Token_Gross08hrs}</Text>
              </View>
              <View style={{width:"18%", alignItems:"center"}}>  
                <Text style={styles.tableText}>{item.Token_Gross816hrs}</Text>
              </View>    
              <View style={{width:"18%", alignItems:"center"}}>    
                <Text style={styles.tableText}>{item.Token_Gross16hrs}</Text>
              </View>
              <View style={{width:"18%", alignItems:"center"}}>    
                <Text style={styles.tableText}>{(item.Token_Gross08hrs+item.Token_Gross816hrs+item.Token_Gross16hrs)}</Text>
              </View> 
             </View>
          }/>: 
        <View style={{ alignItems:"center", justifyContent:"center", height:height*0.3}}>                            
         <Text style={styles.noDataText}>No Data Found</Text>
       </View>}
       </Card>
       </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({  
  noDataView:{
    alignItems:"center", justifyContent:"center", height:"90%"
  },
  noDataText:{
    fontFamily: "Lato-Semibold", fontSize:15
  },
  cardStyle:{
   marginHorizontal:10, marginTop:20
  },
  tableText:{
    fontSize:12, fontFamily: "Lato-Semibold"
  }, 
});




