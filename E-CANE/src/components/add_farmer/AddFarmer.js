import React, { Component } from 'react';
import {StyleSheet,SafeAreaView, Dimensions, Text, View,  ImageBackground, ScrollView, BackHandler, StatusBar, 
        TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import APIManager from '../APIManager'
import { encrypt, decrypt1, decrypt } from "../AESEncryption"
import { Icon, Picker, Card } from 'native-base';
import I18n, { getLanguages } from 'react-native-i18n';
import {RadioGroup, RadioButton} from 'react-native-flexi-radio-button';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';


const { height, width } = Dimensions.get('window');

var radio_props = [
    { label: 'Yes  ', value: 0 },
    { label: 'No', value: 1 }
];

const themeColor = "#8db301"
const buttonColor1 = "#8db30190"

export default class AddFarmer extends Component {
    constructor(props) {
        super(props);
        global.AddFarmer = this
        this.state = {
            language:"हिंदी",
            isLoading: false,
            centerCode: null,
            zoneCode: null,
            altCenterCode: null,
            trnsportCode: null,
            villageCode: null,
            title: "Mr",
            bnkName: "",
            brnchName: "",
            frmrGroupCode: null,
            ttlCultiLand: null,
            farmerHiName: "",
            farmerName: null,
            fatherHiName: "",
            fatherName: null,
            address: null,
            AccNo: null,
            AccHldrName: null,
            MobNo: null,
            aadharNo: null,
            pAcBankAiId: null,
            zoneList: [],
            centerCoeList: [],
            trnsportMode: [],
            villageCodeList: [],
            bankList: [],
            bankBrnchList: [],
            value:"0",
            branchAiId:null,
            userData:{},
            modal:true,
            IFSC:"",
            errors:{}
        }
    }

    static navigationOptions = {
        header: null,

    };

    async componentDidMount() {
        this.retriveData();
        this.getZoneList();
        this.getTransportMode();
        this.getBankList();
        BackHandler.addEventListener('hardwareBackPress', this.handleAndroidBackButton);

    }

    handleAndroidBackButton() {
        global.AddFarmer.props.navigation.goBack();
        return true;
    }


    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidBackButton);

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
  
    onLanguageChange(){
       I18n.locale = (this.state.language=="हिंदी")?"hi":"en";
      this.setState({language:(this.state.language=="हिंदी")?"English":"हिंदी"})
    
    } 

    componentWillMount() {
        I18n.locale = 'en';
    } 

    onLogOut(){
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
        this.hideMenu()
        APIManager.logOut((response)=>{
          if(response.status == "SUCCESS"){
                this.props.navigation.navigate("LoginScreen")
           }
          else{
              Alert.alert("Logout Failed", response.message)
        
           } 
        })
        
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



    getZoneList() {
        this.setState({ isLoading: true })
        APIManager.getZoneList((response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            this.setState({isLoading: false, zoneList: data, zoneCode:data[0].z_code});
            this.getCenterCode();
            this.getVillageList();

        }, (error) => {
            console.log(JSON.stringify(error))
            this.setState({ isLoading: false })
        })
    }

    _zoneList = () => {
        return this.state.zoneList.map(item => {
            return (
                <Picker.Item label={item.z_name} value={item.z_code} />
            );
        });
    };

    getCenterCode() {
        const data = { "pZoneCode": this.state.zoneCode }
        APIManager.getCenter(data, (response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            this.setState({ centerCoeList: data, centerCode:data[0].centre_code, altCenterCode:data[0].centre_code });
        }, (error) => {
            console.log(JSON.stringify(error))
        })
    }

    _centerList = () => {
        return this.state.centerCoeList.map(item => {
            return (
                <Picker.Item label={item.centre_name} value={item.centre_code} />
            );
        });
    };

    getTransportMode() {
        APIManager.getTransportMode((response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            this.setState({ trnsportMode: data, trnsportCode:data[0].M_Code });
        }, (error) => {
            console.log(JSON.stringify(error))
        })
    }

    _transportList = () => {
        return this.state.trnsportMode.map(item => {
            return (
                <Picker.Item label={item.M_Name + "-"+ item.M_HName} value={item.M_Code} />
            );
        });
    };

    getVillageList() {
        const data = { "pZoneCode": this.state.zoneCode, "pCircleCode": 0 }
        APIManager.getVillageList(data, (response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            console.log("Village list", JSON.stringify(data));

            this.setState({ villageCodeList: data, villageCode:data[0].Place_Code, modal:false });
        }, (error) => {
            console.log(JSON.stringify(error))
            this.setState({ modal:false })
        })
    }

    _villageList = () => {
        return this.state.villageCodeList.map(item => {
            return (
                <Picker.Item label={item.place_name} value={item.Place_Code} />
            );
        });
    };

    getBankList(){
     const data = { "pIsActive": "N" }
        APIManager.getBankList(data, (response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            this.setState({ bankList: data, pAcBankAiId:data[0].ac_bank_ai_id});
            this.getBankBranchList()
        }, (error) => {
            console.log(JSON.stringify(error))
        })
    }

    _bankList = () => {
        return this.state.bankList.map(item => {
            return (
                <Picker.Item label={item.ac_bank_name} value={item.ac_bank_ai_id} />
            );
        });
    };


    getBankBranchList(){
        const data = { "pAcBankAiId": this.state.pAcBankAiId }

        APIManager.getBankBranchList(data, (response) => {
            const data = JSON.parse(decrypt1(response.data.data.content));
            this.setState({ bankBrnchList: data, branchAiId:data[0].ac_bnk_br_ai_id, brnchName:data[0].ac_bnk_br_name, IFSC:data[0].ac_bnk_br_ifsc});
        }, (error) => {
            console.log(JSON.stringify(error))
        })
    }



    _branchList = () => {
        return this.state.bankBrnchList.map(item => {
            return (
                <Picker.Item label={item.ac_bnk_br_name} value={item.ac_bnk_br_ai_id} />
            );
        });
    };

    

    onZoneChange = (value, index) => {
        this.setState({ zoneCode: value})
        this.getCenterCode();
    }

    onCenterChange = (value, index) => {
        this.setState({ centerCode: value })
    }

    onAltCenterChange = (value, index) => {
        this.setState({ altCenterCode: value })
    }

    onTransPortChange = (value, index) => {
        this.setState({ trnsportCode: value })
    }

    onVillageChange = (value, index) => {
        this.setState({ vlgeCode: value})
   
    }

    onTitleChange = (value, index) => {
        this.setState({ title: value })
    }

    onBankChange = (value, index) => {
            this.setState({ pAcBankAiId: value })
            this.getBankBranchList()
        
    }

    onBranchChange = (value, index) => {
        this.setState({ branchAiId: value, brnchName:this.state.bankBrnchList[index].ac_bnk_br_name })
    }



    submitAddFrmrData = () => {

     if(this.validForm()){
            this.setState({ isLoading: true })
     
            const data = {
                "paccount_name": this.state.farmerName,
                "pGFatherName": this.state.fatherName,
                "pGTitle": this.state.title,
                "pGHindiName": this.state.farmerHiName,
                "pfathernamehindi": this.state.fatherHiName,
                "pGVillageCode": this.state.villageCode,
                "pGZoneCode": this.state.zoneCode,
                "pGCode":parseInt(this.state.centerCode),
                "paltcentrecode": parseInt(this.state.altCenterCode),
                "pModecode": this.state.trnsportCode,
                "pGGroupFarmer": this.state.frmrGroupCode,
                "pMemberYear": 2020,
                "ptotalcultivate": parseInt(this.state.ttlCultiLand),
                "pGMadhi": 0,
                "pGJadi": 0,
                "pgnorpa": 0,
                "pGVarMadhi": "0",
                "pGVarJadi": "0",
                "pGVarNorpa": "0",
                "plastyearsupply": 0,
                "pbankcode": "0",
                "pGBankAcctNo": this.state.AccNo,
                "pGAdharCardNo": this.state.aadharNo,
                "pGMobileNo": this.state.MobNo,
                "pGFreedomFighter": parseInt(this.state.value),
                "pimagpath": "",
                "pAccountId": 0,
                "pGIFSCCode": this.state.IFSC,
                "paddress": this.state.address,
                "pFarmerBankAccName": this.state.AccHldrName,
                "pBankAiId": this.state.pAcBankAiId,
                "pBankBranchAddres": this.state.brnchName,
                "pCreatedBy": parseInt(this.state.userData.userId),
                "pAccBranchBrId": this.state.branchAiId
            }
            console.log(JSON.stringify(data))

            this.setState({ isFormLoading: true })
            APIManager.submitAddFarmer(data, (response) => {
                const data = JSON.parse(decrypt1(response.data.data.content));
                this.setState({ isLoading: false })
                console.log("on Farmer Add", JSON.stringify(data));

                if(response.data.status == "SUCCESS"){

                  if(data[0].serverResponseType == "SUCCESS"){
                   Alert.alert("Farmer Added Successfuly", data[0].serverResponseMsg)
                   this.setState({ farmerName:null, fatherName:null,  frmrGroupCode:null, ttlCultiLand:null, address:null,
                                   AccNo:null, aadharNo:null, AccHldrName:null, MobNo:null, farmerHiName:"", fatherHiName:"" })
                  }else{
                     Alert.alert("Failed to Add Farmer", data[0].serverResponseMsg)
                  }
                 
                }else{
                   Alert.alert("Failed to Add Farmer", response.data.message)

                }
            }, (error) => {
                console.log(JSON.stringify(error))
                this.setState({ isLoading: false })
                Alert.alert("Failed to Add Farmer", error.message)

            })

        }

  }

  validForm(){
       let { farmerName, fatherName,  frmrGroupCode, ttlCultiLand, address,
             AccNo, aadharNo, AccHldrName, MobNo } = this.state;
        let errors = {};
        let formIsValid = true;
        let message = ""
        if (farmerName == null) {
          formIsValid = false;
          //errors["farmerName"] = "*Please enter Farmer Name";
          message = "*Please enter Farmer Name";

        }
        if (fatherName == null) {
          formIsValid = false;
          //errors["fatherName"] = "*Please enter Father Name";
          message = "*Please enter Father Name";

        }
        if (frmrGroupCode == null || frmrGroupCode.length != 8) {
          formIsValid = false;
          //errors["frmrGroupCode"] = "*Please enter Group Code";
          message = "*Please enter Group Code";

        }
        if (ttlCultiLand == null) {
          formIsValid = false;
          //errors["ttlCultiLand"] = "*Please enter Total Cultivated Land";
          message = "*Please enter Total Cultivated Land";

        }

         if (address == null) {
          formIsValid = false;
          //errors["address"] = "*Please enter Address";
          message = "*Please enter Address";

        }

        if (AccNo == null) {
          formIsValid = false;
          //errors["AccNo"] = "*Please enter your Account No.";
          message = "*Please enter your Account No.";

        }

         if (aadharNo == null || aadharNo.length != 12) {
          formIsValid = false;
          //errors["aadharNo"] = "*Please enter a Valid Aadhaar No.";
          message = "*Please enter a Valid Aadhaar No.";

        }

        if (AccHldrName == null) {
          formIsValid = false;
          //errors["AccHldrName"] = "*Please enter a Valid Mobile No.";
          message = "*Please enter Bank Account Holder Name";

        }

        if (MobNo == null || MobNo.length != 10) {
            formIsValid = false;
            //errors["MobNo"] = "*Please enter a valid Mobile No.";
            message = "*Please enter a valid Mobile No.";

        }

        if(!formIsValid){
          Alert.alert("Failed to Add", message)
        }

       // alert(message)
        this.setState({errors});
        return formIsValid;
  }

 render() {
    return (
      <SafeAreaView style={{flex:1, backgroundColor:"#dcdcdc80"}}  > 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{ padding: 10, width: 50, height: 50, justifyContent: 'center', }}>
          <Icon type={"MaterialIcons"} name="keyboard-backspace" size={30} color="#000000" solid />
        </TouchableOpacity>
       <Image
            style={{width: "25%", height: "90%"}}
           // resizeMode="contain"
            source={require('./../../assets/logo_white.png')}
          />
        <View style={{flexDirection:"row", position:'absolute', right:10}}>
        <Menu 
            ref={this.setMenuRef}
            button={<Icon  name='dots-vertical' type="MaterialCommunityIcons"     
                           style={{fontSize:25, color:'#000000'}}
                           onPress={this.showMenu} /> 
           }
          >
            <MenuItem onPress={()=>this.onLanguageChange()}>{this.state.language}</MenuItem>
            <MenuDivider />
            <MenuItem onPress={() => this.onLogOut()}>Log Out</MenuItem>
          </Menu>
      </View>  

      </View>    
      <ScrollView style={{ flex: 1, paddingHorizontal:10 }}>

          <Card>
            <View style={{backgroundColor:buttonColor1}}>
              <Text style={styles.headline}>{I18n.t("Farmer Master")}</Text>
            </View>

                <View style={{marginTop:10, paddingHorizontal: 10}}>
                    <View style={{ flexDirection: 'row', width: '30%', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15 }}>{I18n.t("Zone Code")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View> 

                     <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>       
                        <Picker
                              selectedValue={this.state.zoneCode} 
                              style={{ height: 30, width:"100%"}}
                              mode = 'dropdown'  
                              onValueChange={(value, index)=>this.onZoneChange(value, index)}             
                              >  
                              {this._zoneList()}               
                         </Picker>                     
                    </View>   
                </View>

                <View style={{marginTop:10, paddingHorizontal: 10}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15 }}>{I18n.t("Center Code")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View> 

                     <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>       
                        <Picker
                              selectedValue={this.state.cntrCode} 
                              style={{ height: 30, width:"100%"}}
                              mode = 'dropdown'  
                              onValueChange={(value, index)=>this.onCenterChange(value, index)}             
                              >  
                              {this._centerList()}               
                         </Picker>                     
                    </View>   
                </View>

               <View style={{marginTop:10, paddingHorizontal: 10,}}>
                    <View style={{ flexDirection: 'row',  flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15 }}>{I18n.t("Alternate Center Code")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View> 

                     <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>       
                        <Picker
                              selectedValue={this.state.cntrCode} 
                              style={{ height: 30, width:"100%"}}
                              mode = 'dropdown'  
                              onValueChange={(value, index)=>this.onAltCenterChange(value, index)}             
                              >  
                              {this._centerList()}               
                         </Picker>                     
                    </View>   
                </View>

                <View style={{marginTop:10, paddingHorizontal: 10}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15 }}>{I18n.t("Transport Mode")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View> 

                     <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>       
                        <Picker
                              selectedValue={this.state.trnsportCode} 
                              style={{ height: 30, width:"100%"}}
                              mode = 'dropdown'  
                              onValueChange={(value, index)=>this.onTransPortChange(value, index)}             
                              >  
                              {this._transportList()}               
                         </Picker>                     
                    </View>   
                </View>

                  <View style={{marginTop:10, paddingHorizontal: 10}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15 }}>{I18n.t("Village Code")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View> 

                     <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>       
                        <Picker
                              selectedValue={this.state.vlgeCode} 
                              style={{ height: 30, width:"100%"}}
                              mode = 'dropdown'  
                              onValueChange={(itemValue, itemIndex) => this.onVillageChange(itemValue, itemIndex)}            
                              >  
                              {this._villageList()}               
                         </Picker>                     
                    </View>   
                </View>



                <View style={{ paddingHorizontal: 10,  marginTop:10}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15, }}>{I18n.t("Farmer Group Code (8 Digit)")}</Text>
                        <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                    </View>
                    <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                        <TextInput
                            style={{ height: 40, width: "100%"}}
                            placeholder="Farmer Group Code"
                            value={this.state.frmrGroupCode}
                            returnKeyType="next"
                            returnKeyLabel={"next"}
                            onChangeText={(text) => this.setState({ frmrGroupCode: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                    <View style={{ paddingHorizontal: 10,  marginVertical:10}}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
                        <Text style={{ fontSize: 15,  }}>{I18n.t("Total Cultivated Land(Acre)")}</Text>
                        <Text style={{ fontSize: 15,  color: 'red' }}>*</Text>
                    </View>
                    <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                        <TextInput
                            style={{ height: 40, width: "100%"}}
                            placeholder="Total Cultivated Land"
                            value={this.state.ttlCultiLand}
                            returnKeyType="next"
                            returnKeyLabel={"next"}
                            onChangeText={(text) => this.setState({ ttlCultiLand: text })}
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </Card>

            <Card>
                <View style={{backgroundColor:buttonColor1}}>
                  <Text style={styles.headline}>{I18n.t("Farmer Details")}</Text>
                </View>
                    <View style={{flexDirection:"row", marginTop:10, paddingHorizontal: 10}}>
                        <View style={{ flexDirection: 'row', width: '50%', flexWrap: 'wrap', }}>
                            <Text style={{ fontSize: 15}}>{I18n.t("Title")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{width:"50%", borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <Picker
                                style={{ height: 30, width:"100%"}}
                                selectedValue={this.state.title}
                                onValueChange={(value, index)=>this.onTitleChange(value, index)}>
                                <Picker.Item label="Mr. - श्रीमान" value="Mr" />
                                <Picker.Item label="Mrs - श्रीमती" value="Mrs" />
                                <Picker.Item label="Ms - सुश्री" value="Ms" />
                                <Picker.Item label="Other - अन्य" value="Other" />
                            </Picker>
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,  }}>{I18n.t("Farmer Name")}</Text>
                            <Text style={{ fontSize: 15,  color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1  }}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                placeholder="Farmer Name"
                                value={this.state.farmerName}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ farmerName: text })}
                            />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15 }}>{I18n.t("Farmer Name Hindi")}<Text style={{ fontSize: 15, color: 'red' }}> </Text></Text>

                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                placeholder="Farmer Name Hindi"
                                value={this.state.farmerHiName}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ farmerHiName: text })} />
                        </View>
                    </View>

                    <View style={{flexDirection:"row", paddingHorizontal: 10, justifyContent:"space-between"}}>
                        <Text style={{ fontSize: 15,  marginTop:15, }}>{I18n.t("Freedom Fighter")}<Text style={{ fontSize: 15, color: 'red' }}>*</Text></Text>
                        <RadioGroup 
                                size={20} 
                                thickness={2}
                                color='#232f3e'
                                selectedIndex={this.state.value}
                                style={{flexDirection:"row", marginTop:5}}
                                onSelect = {(index, value) => this.setState({value})}
                               >
                                <RadioButton value={'0'} >
                                  <Text>Yes</Text> 
                                </RadioButton>
                         
                                <RadioButton value={'1'}>
                                  <Text>No</Text>
                                </RadioButton>
                         
                        </RadioGroup>  
                    </View>

                    <View style={{ paddingHorizontal: 10}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,  }}>{I18n.t("Father's Name")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                placeholder="Father Name"
                                value={this.state.fatherName}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ fatherName: text })} />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,  }}>{I18n.t("Father Name Hindi")}</Text>

                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%"  }}
                                placeholder="Father Name Hindi"
                                value={this.state.fatherHiName}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ fatherHiName: text })} />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingBottom:15, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,  }}>{I18n.t("Address")}<Text style={{ fontSize: 15, color: 'red' }}> *</Text></Text>


                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                placeholder="Address"
                                multiline={true}
                                value={this.state.address}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ address: text })}
                            />
                        </View>
                    </View>

                
            </Card>

            <Card>
                <View style={{backgroundColor:buttonColor1}}>
                  <Text style={styles.headline}>{I18n.t("Bank Details")}</Text>
                </View>
                <View style={{ padding: 5, justifyContent: 'center', backgroundColor: '#FFFFFF', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
                <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Bank Name")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                                <Picker
                                    style={{ height: 30, width:"100%" }}
                                    selectedValue={this.state.bnkName}
                                    onValueChange={(itemValue, itemIndex) => this.onBankChange(itemValue, itemIndex)}>
                                    {this._bankList()}
                                </Picker>
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Bank Branch Name")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                                    <Picker
                                        style={{ height: 30, width:"100%" }}
                                        selectedValue={this.state.brnchName}
                                        onValueChange={(value, index)=>this.onBranchChange(value, index)}>
                                        {this._branchList()}
                                    </Picker>

                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Bank Account Number")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                keyboardType="numeric"
                                placeholder="Account No"
                                value={this.state.AccNo}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ AccNo: text })} />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Account Holder Name")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                placeholder="Account Holder Name"
                                value={this.state.AccHldrName}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ AccHldrName: text })} />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Aadhaar Card Number")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                keyboardType="numeric"
                                placeholder="Aadhaar Number"
                                value={this.state.aadharNo}
                                returnKeyType="next"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ aadharNo: text })} />
                        </View>
                    </View>

                    <View style={{ marginTop:10, paddingHorizontal: 10,}}>
                        <View style={{  flexDirection: 'row', flexWrap: 'wrap',  }}>
                            <Text style={{ fontSize: 15,}}>{I18n.t("Mobile Number")}</Text>
                            <Text style={{ fontSize: 15, color: 'red' }}>*</Text>
                        </View>
                        <View style={{borderWidth:1, borderRadius:5, borderColor:buttonColor1}}>
                            <TextInput
                                style={{ height: 40, width: "100%" }}
                                keyboardType="numeric"
                                placeholder="Mobile Number"
                                value={this.state.MobNo}
                                returnKeyType="done"
                                returnKeyLabel={"next"}
                                onChangeText={(text) => this.setState({ MobNo: text })} />
                        </View>
                    </View>
                </View>
            </Card>
                

            <View style={{alignItems:"center", marginVertical:15}}>
            {(this.state.isLoading==true)?
            <ActivityIndicator size="small" color="#000000" style={{textAlign:"center"}}/>: 
            <TouchableOpacity onPress={this.submitAddFrmrData.bind(this)} style={{elevation:10, paddingVertical:15, width:180, backgroundColor:themeColor, borderRadius:50}}>
              <Text style={{color:'#ffffff', fontSize:15, textAlign:"center",  fontFamily: "Lato-Semibold"}}>{I18n.t("Submit")}</Text>
             </TouchableOpacity>}
           </View>  

              <Modal animationType = {"slide"}
                    transparent = {true}
                    visible = {this.state.modal}
               >
               
                <View  style = {styles.modal}>
                  <View style={styles.modalView}>
                    <Text style={{color:'#000', fontSize:15, textAlign:"center", fontFamily: "Lato-Semibold"}}>Please Wait..</Text>
                    <ActivityIndicator size="small" color="#000000" style={{textAlign:"center"}}/>                    
                  </View>
                </View>
          </Modal>   

        </ScrollView>
       </SafeAreaView>
        );
    }
}
const styles = StyleSheet.create({  
    container:{    
        flex:1, backgroundColor:"#f3f3f3f3"
    },
    header: {
      elevation:8,height:height*0.075, backgroundColor:themeColor, flexDirection:"row", alignItems:"center", paddingHorizontal:15, borderBottomWidth:StyleSheet.hairlineWidth
    },
    headline:{ 
        color:'#232f3e', padding:8,  fontFamily: "Lato-Semibold", fontSize:15
    },
    modal: {
      flex: 1,  justifyContent: 'center', alignItems: 'center',backgroundColor:'#00000080'
    },
    modalView:{
     width: '85%',backgroundColor:'#ffffff', justifyContent:'center', padding:15,  flexDirection:"row"
    },   
})   