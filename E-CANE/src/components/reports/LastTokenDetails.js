import React, {Component} from 'react';
import { StyleSheet, View, Text, Dimensions, RefreshControl, ScrollView, Alert, BackHandler} from 'react-native';
import Accordian from './../Accordian'
import APIManager from './../APIManager';
import { Container, Header, Left, Body, Right, Button, Title,  Content,Segment, 
         Card, CardItem, Accordion, DatePicker, Footer, FooterTab, Badge, Form, Picker} from 'native-base'; 
import { encrypt, decrypt } from "./../AESEncryption"
import I18n, { getLanguages } from 'react-native-i18n';

const {height, width} = Dimensions.get('window');
I18n.fallbacks = true;
   
I18n.translations = {
  'en': require('./../../translations/en'),
  'hi': require('./../../translations/hi'),

};


export default class LastTokenDetails extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data:[],
      userData:{},
      loading:true,
      language:"en"
    }
     global.LastTokenDetails = this;
   }

   async componentDidMount(){
      if(APIManager.isDev != true){ 
       await APIManager.setHost()
      }
      // this.retriveData()
       this.getLastTokenGrossData()
    
      setInterval(() => {
         this.getLastTokenGrossData()
      },300000)
     BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);

  }


  componentWillUnmount() {
     BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
    
     }
 

 componentWillMount() {
    I18n.locale = this.state.language;
  } 

   handleAndroidBackButton() {
        global.LastTokenDetails.props.navigation.goBack();
        return true;
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
      <ScrollView style={styles.container} refreshControl={ <RefreshControl  refreshing={this.state.loading}
                                                            onRefresh={this.onRefresh.bind(this)}
                                                                      />  }>
        <Card style={{}}> 
         <View style={styles.row} onPress={()=>this.toggleExpand()}>
          
           <View style={{width:"30%"}}> 
            <Text style={[styles.title]}>{I18n.t("Slip")} ({I18n.t("Counter")})</Text>
           </View>

           <View style={{width:"30%", alignItems:"flex-start"}}> 
            <Text style={[styles.title]}>Current {I18n.t("Slip No")}</Text>
           </View>
          
           <View style={{width:"40%", alignItems:"center"}}> 
            <Text style={[styles.title]}>{I18n.t("Date")}</Text>
           </View>
        </View>                      
        { this.renderAccordians() }
       </Card> 
      </ScrollView>
    );
  }

  renderAccordians=()=> {
    const items = [];
    for (item of this.state.data) {
        items.push(
            <Accordian 
                data = {item}
            />
        );
    }
    return items;
  }
}

const styles = StyleSheet.create({
  container: {
   flex:1, paddingHorizontal:5  
  },
   row:{
        flexDirection: 'row',
        padding:10,
        backgroundColor: "#d8a800",
    },
  title:{
        fontSize: width*0.035,
        fontFamily:'Lato-Black',
        color: "#000000",
    },  
});