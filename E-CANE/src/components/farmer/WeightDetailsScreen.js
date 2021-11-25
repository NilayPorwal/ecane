import React, { Component } from 'react';
import {StyleSheet, Dimensions, Text, View, ImageBackground, Image, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import APIManager from './../APIManager';
import I18n, { getLanguages } from 'react-native-i18n';
import { encrypt, decrypt } from "./../AESEncryption"
import { Icon } from 'native-base';

I18n.fallbacks = true;
   
I18n.translations = {
  'en': require('./../../translations/en'),
  'hi': require('./../../translations/hi'),

};

const {height, width} = Dimensions.get('window');


export default class WeightDetailsScreen extends Component {
    constructor(props) {
    super(props);
    this.state = {  
       farmerDetails:[],
       farmerCode:this.props.navigation.state.params.farmerCode,
       language:this.props.navigation.state.params.language
      }
      global.WeightDetailsScreen = this;
    }

    static navigationOptions = {
        header: null,
             
    }; 

    componentDidMount(){
       BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);    
       this.getFarmerDetails()
    }

    handleAndroidBackButton() {
     
      global.WeightDetailsScreen.props.navigation.goBack();
       return true;
    }      
            
    
    componentWillUnmount() {
       BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);
      
    }

    componentWillMount() {
      I18n.locale = this.state.language;
    }

  getFarmerDetails(){

   const data = {  
    "pFarmerCode": this.state.farmerCode           
   } 

  APIManager.getFarmerDetails(data, (response)=>{
      console.log(JSON.stringify(response));   
       if (response.data.status === "SUCCESS") {
          response.data.data = JSON.parse(decrypt(response.data.data.content));
          console.log("Farmer Details: " + JSON.stringify(response.data));
          //this.getCaneType();
          this.setState({farmerDetails:response.data.data})   
  
        } 
        else {
            this.setState({isLoading:false})
            Alert.alert("Error", "Invalid farmer code")        
            console.log('error', response);   
        }  
        
   }, (error)=>{
        this.setState({isLoading:false})
        console.log('error', JSON.stringify(error));   
   })
 }


    redirectTo(screenType){
      if(screenType === 1){
       this.props.navigation.navigate("FarmerDetails", {
        farmerCode:this.state.farmerCode,
        farmerDetails:this.state.farmerDetails,
        language:this.state.language
       })
      }
      else if(screenType === 2){
       this.props.navigation.navigate('TareDetailsScreen', {
        farmerCode:this.state.farmerCode,
        farmerDetails:this.state.farmerDetails,
        language:this.state.language

       })
      }
      else if(screenType === 3){
         this.props.navigation.navigate('LastTokenDetails', {
         language:this.state.language

       })
      }  
        
    }


  render() {
    return (
       <ImageBackground source={require('./../../assets/Splash.png')} style={{flex:1}}>
          <ScrollView keyboardShouldPersistTaps='handled' showsVerticalScrollIndicator={false}>
          <View style={{alignItems:"center", marginTop:"5%"}}> 
              <Image
                  style={{width: 150, height: 150}}
                  source={require('./../../assets/ic_launcher.png')}
                />  
              <View style={{width:"80%"}}>  
                <Text style={{fontSize:15, fontFamily: "Lato-Semibold", color:"#000000", textAlign:"center"}}>MAHAKAUSHAL SUGAR & POWER INDUSTRIES LIMITED</Text>  
              </View> 
            </View>
            <View style={{justifyContent:"center", alignItems:"center", marginTop:10, flexDirection:"row"}}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => this.redirectTo(1)} style={{}}>
               <Image
                  style={{width: 120, height: 120}}
                  source={require('./../../assets/farmer.png')}
                /> 
                 <View  style={styles.buttonStyle}>
                    <Text selectable={true} style={{color:"#FFFFFF", fontSize:15, padding:10, fontFamily: "Lato-Semibold"}}>{I18n.t("Farmer Details")}</Text>
                  </View>
              </TouchableOpacity> 
               <TouchableOpacity activeOpacity={0.8}  onPress={() => this.redirectTo(2)} style={{marginLeft:15}}> 
                <Image
                  style={{width: 120, height: 120}}
                  source={require('./../../assets/weight.png')}
                /> 
                 <View  style={styles.buttonStyle}>
                    <Text selectable={true} style={{color:"#FFFFFF", fontSize:15, padding:10, fontFamily: "Lato-Semibold"}}>{I18n.t("Weight Details")}</Text>
                  </View>
                </TouchableOpacity>
          
               </View>
               <View style={{alignItems:"center", marginTop:10}}>
                <TouchableOpacity activeOpacity={0.8}  onPress={() => this.redirectTo(3)} style={{}}> 
                  <Image
                    style={{width: 120, height: 120}}
                    source={require('./../../assets/weight.png')}
                  /> 
                   <View  style={styles.buttonStyle}>
                      <Text selectable={true} style={{color:"#FFFFFF", fontSize:15, padding:10, fontFamily: "Lato-Semibold"}}>{I18n.t("Last Token Details")}</Text>
                    </View>
                </TouchableOpacity>
               </View>  
                 
             
              <TouchableOpacity onPress={()=>this.handleAndroidBackButton()} style={{position:"absolute", top:15, left:15}}>    
               <Icon  type="AntDesign" name="arrowleft" style={{fontSize:18, color:"#000000"}} />
              </TouchableOpacity>
            </ScrollView>
             <View style={{alignItems:"center", position:"absolute", bottom:10, right:0, left:0 }}>
                <Image
                  style={{width:width*0.5, height:height*0.1}}
                  resizeMode="contain"
                  source={require('./../../assets/logo.png')}
                />
             </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  buttonStyle:{
    marginTop:15, backgroundColor:'#006344', justifyContent:'center', alignItems:'center', elevation:8
  }

});
