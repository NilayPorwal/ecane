import React, {Component} from 'react';
import {Platform, StyleSheet,  View, Dimensions, processColor, FlatList, TextInput, Alert, Modal, ScrollView} from 'react-native';
import { WebView } from "react-native-webview";
//import { VLCPlayer, VlCPlayerView } from 'react-native-vlcplayer';
import APIManager from './APIManager';

const {height, width} = Dimensions.get('window').height

global.CameraScreen;
export default class CameraScreen extends Component {
   constructor(props) {
       super(props);
      this.state = {
       ipAddress:null,
       paused:false,
       camUri:[{"uri":"rtsp://admin:123456@192.168.0.221/0"}, 
               {"uri":"rtsp://admin:123456@192.168.0.222/0"}, 
               {"uri":"rtsp://admin:123456@192.168.0.223/0"},
               {"uri":"rtsp://admin:123456@192.168.0.224/0"},
               {"uri":"rtsp://admin:123456@192.168.0.225/0"},
               {"uri":"rtsp://admin:123456@192.168.0.226/0"}]
     }
    global.CameraScreen = this;

   }

    static navigationOptions = {
       header: null,

   };

   componentDidMount(){
       APIManager.getValueForKey("ipAddress", (ipAddress) =>{ 
        this.setState({ipAddress})
       }, (error)=>{
        console.log(JSON.stringify(error))
       })
   }




  render() {
    return (
     <View style={{flex:1}}>
    {
      <WebView
        source={{uri: 'http://'+ this.state.ipAddress +'/cam'}}
        style={{}}
      />
     }  

      {

      // <FlatList  
      //     data={this.state.camUri}
      //     extraData={this.state}
      //     numColumns={2}
      //     renderItem={({item, index}) => 
          
      //       <VLCPlayer
      //        ref={ref => (this.vlcPlayer = ref)}
      //        style={{width:180, height:200}}
      //        videoAspectRatio="16:9"
      //        paused={this.state.paused}
      //        source={{ uri: item.uri}} 
           
      //         />
      //       }
      //     />

     
      }
      </View>
    
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  cardStyle:{
    height:height*0.2, 
    justifyContent:'center'

  }
});
