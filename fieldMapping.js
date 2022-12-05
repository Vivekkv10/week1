import { LightningElement, api, track, wire } from 'lwc';
import getSfFields from '@salesforce/apex/ObjectApiHandler.getListOfFields';
import getExistingObjectMappingJson from '@salesforce/apex/ObjectApiHandler.getExistingObjectMappingJson';
import getVoiroFields from '@salesforce/apex/getVoiroInfo.getVoiroFields';
import insertFieldMappingJson from '@salesforce/apex/ObjectApiHandler.insertFieldMappingJson';
import getExistingFieldMappingJson from '@salesforce/apex/ObjectApiHandler.getExistingFieldMappingJson';
import getFieldMapping from '@salesforce/apex/ObjectApiHandler.getFieldMapping';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';





const objects = [

    {
        label: 'Lead',
        value: 'lead'
    },
    {
        label: 'Line Item',
        value: 'lineItem'
    },
    {
        label: 'RO Document',
        value: 'leadRoDoc'
    },
    {
        label: 'Advertiser',
        value: 'advertiser'
    }
];

export default class fieldMapping extends LightningElement {

    @track objectDataIsRetrievedFromWire = true;
    @track fieldtDataIsRetrievedFromWire = false;
    @track ObjectListForCombobox = [];
    @track FieldNamesForCombobox = [];
    @track voiroFieldCombobox = [];
    @track selectedOptionValue;
    @track selectedOptionLabel;
    @track keyIndex = 0;
    @track slNo = 1;
    @track selectedObjectName;

    @track voiroFieldFromApex = {}


    @track fieldItem =
        {
            slNo: '',
            id: '',
            sfobjectlabel: '',
            voiroObjectlabel: '',
            sfobjectName: '',
            voiroObjectName: '',
            sfFieldApi: '',
            sfFieldLabel: '',
            voirofieldApi: '',
            voirofieldLabel: ''
        };
    finalList = [];

    @track itemList = [
        {
            slNo: 1,
            id: 0,
            sfobjectlabel: '',
            voiroObjectlabel: '',
            sfobjectName: '',
            voiroObjectName: '',
            sfFieldApi: '',
            sfFieldLabel: '',
            voirofieldApi: '',
            voirofieldLabel: ''
        }
    ];
    objectMappingList = [];
    sfObjectList = [];
    voiroObjectList = []



    @wire(getExistingObjectMappingJson)
    objectMapping({ data, error }) {
        if (data) {

console.log(data)
// Add Values to the Set

            this.objectMappingList = JSON.parse(data);
            for (let element of this.objectMappingList) {
                if (element['sfObjectApi'] != '') {
           
            //console.log(objectSet)
                     this.sfObjectList1 = [...this.sfObjectList1, {
                        label: element['sfObjectLabel'],
                        value: element['sfObjectApi']
                    }];
                    this.voiroObjectList = [...this.voiroObjectList, {
                        label: element['voiroObjectLabel'],
                        value: element['voiroObjectApi']
                    }]

                }



            }


   //to remove duplicate Object Options         
this.sfObjectList = this.sfObjectList1.filter((obj, pos, arr) => {
            return arr.map(mapObj =>
                  mapObj.label).indexOf(obj.label) == pos;
            });
          console.log(this.sfObjectList);




        }
        else if (error) {

        }
    }

 sfObjectList1=[];

    addNewRow() {

        this.slNo += 1;
        this.keyIndex++;
        let i = this.keyIndex;
        this.fieldItem.id = i;
        this.fieldItem.slNo = this.slNo;
        this.itemList.push(this.fieldItem);
        this.fieldItem = {
            slNo: '',
            id: '',
            sfobjectlabel: '',
            voiroObjectlabel: '',
            sfobjectName: '',
            voiroObjectName: '',
            sfFieldApi: '',
            sfFieldLabel: '',
            voirofieldApi: '',
            voirofieldLabel: ''
        };
        // console.log(this.itemList)

        // console.log('add row slNo '+this.slNo)
        //  console.log(' add row id '+this.keyIndex)
    }

    removeRow(event) {
        let toBeDeletedRowIndex = (event.target.name);

        let listAfterDelete = [];

        for (let i = 0; i < this.itemList.length; i++) {
            let tempRecord = Object.assign({}, this.itemList[i]);
            if (tempRecord.id !== toBeDeletedRowIndex) {

                listAfterDelete.push(tempRecord);
            }

        }

        for (let i = 0; i < listAfterDelete.length; i++) {
            listAfterDelete[i].id = i;
            listAfterDelete[i].slNo = i + 1;
        }
        this.itemList = listAfterDelete;

        this.slNo -= 1;

        // console.log('remove row slNo '+this.slNo)
        // console.log(' remove row id '+this.keyIndex)
    }

    removeAllRows() {

        this.itemList = [
            {
                slNo: 1,
                id: 0,
                sfobjectlabel: '',
                voiroObjectlabel: '',
                sfobjectName: '',
                voiroObjectName: '',
                sfFieldApi: '',
                sfFieldLabel: '',
                voirofieldApi: '',
                voirofieldLabel: ''
            }
        ];
        this.slNo = 1;
        this.keyIndex = 1;
        // console.log('remove all row slNo '+this.slNo)
        //   console.log(' remove all row id '+this.id)


    }


    get ObjectOptions() {
        return this.sfObjectList;
    }
    selectedVoiroObjectName;
    selectedVoiroObjectLabel;
    selectedSfObjectLabel;


    @track selectedSfObjectName;
    handleOptionChange(event) {

        this.selectedSfObjectName = event.detail.value;
        //  console.log(this.selectedSfObjectName)

        getFieldMapping({ ObjectName: this.selectedSfObjectName })
            .then((result) => {
                console.log('result.length ' + result.length);
                if (result.length > 0) {
                    let max;
                    for (let Element of result) {
                        //  console.log(Element)
                        //  console.log(Element['JSON__c'])


                        this.itemListFromSf = JSON.parse(Element['JSON__c']);

                    }
                    for (let ele of this.itemListFromSf) {
                        if ((max == null) || (parseInt(ele['slNo']) > (parseInt(max)))) {
                            max = parseInt(ele['slNo']);
                        }

                    }
                    this.slNo = max;
                    this.keyIndex = max - 1;
                    // console.log(' current slNo '+this.slNo)
                    //  console.log(' current id '+this.keyIndex)


                    this.itemList = this.itemListFromSf
                }
                else {
                    this.itemList = [
                        {
                            slNo: 1,
                            id: 0,
                            sfobjectlabel: '',
                            voiroObjectlabel: '',
                            sfobjectName: '',
                            voiroObjectName: '',
                            sfFieldApi: '',
                            sfFieldLabel: '',
                            voirofieldApi: '',
                            voirofieldLabel: ''
                        }
                    ];
                    this.slNo = 1;
                    this.keyIndex = 0;
                }

            })
            .catch((error) => {
                this.error = error;

            });


        for (let i = 0; i < this.objectMappingList.length; i++) {
            if (this.objectMappingList[i]['sfObjectApi'] == this.selectedSfObjectName) {
                this.selectedSfObjectLabel = this.objectMappingList[i]['sfObjectLabel'];
                this.selectedVoiroObjectName = this.objectMappingList[i]['voiroObjectApi'];
                this.selectedVoiroObjectLabel = this.objectMappingList[i]['voiroObjectLabel'];
            }

        }


        getSfFields({ objectAPIName: this.selectedSfObjectName })
            .then((result) => {
                this.FieldNamesForCombobox = [];
                let objStr = JSON.parse(result);
                for (let i of Object.keys(objStr)) {
                    this.FieldNamesForCombobox = [...this.FieldNamesForCombobox, {
                        value: i,
                        label: objStr[i]
                    }];
                }
            })
            .catch((error) => {
                this.error = error;

            });

        // console.log('selectedSfObjectName -> ' + this.selectedSfObjectName);
        //  console.log('selectedVoiroObjectName -> ' + this.selectedVoiroObjectName);
        // console.log('selectedVoiroObjectLabel -> ' + this.selectedVoiroObjectLabel);

    }




    get sfFieldOptions() {
        return this.FieldNamesForCombobox
    }

    handleSfFieldChange(event) {
        let key = event.target.dataset.id;
        this.itemList[key]['sfFieldApi'] = event.detail.value;
        this.itemList[key]['sfFieldLabel'] = event.detail.label;
        this.itemList[key]['sfobjectName'] = this.selectedSfObjectName;
        this.itemList[key]['sfobjectlabel'] = this.selectedSfObjectLabel;

    }

    @wire(getVoiroFields, { objName: '$selectedVoiroObjectName' })
    getVoiroFieldsFromApex({ error, data }) {
        if (data) {
            this.voiroFieldCombobox = [];
            this.voiroFieldFromApex = data;
            for (let element in this.voiroFieldFromApex.actions['POST']) {
                this.voiroFieldCombobox = [... this.voiroFieldCombobox, {
                    value: element,
                    label: this.voiroFieldFromApex.actions['POST'][element]['label']
                }];
            }
        }
        else {
            console.log(error);
        }

    }

    get voiroFieldOptions() {
        return this.voiroFieldCombobox;
    }




    handleVoiroFieldChange(event) {
        let key = event.target.dataset.id;
        this.itemList[key]['voirofieldApi'] = event.detail.value;
        this.itemList[key]['voirofieldLabel'] = event.detail.label;
        this.itemList[key]['voiroObjectName'] = this.selectedVoiroObjectName;
        this.itemList[key]['voiroObjectlabel'] = this.selectedVoiroObjectLabel;


    }


    createJSON() {
        //console.log('this.itemList    '+JSON.stringify(this.itemList));
        this.finalList = []
        for (let i = 0; i < this.itemList.length; i++) {
            let sfObjectKey = this.itemList[i]['sfobjectName'];
            // console.log('sobject Name Key  '+sfObjectKey)
            // let objArray = this.itemList[i]['sfobjectName']
            let objArray = [];
            objArray.push({
                sfFieldApi: this.itemList[i]['sfFieldApi'],
                sfFieldLabel: this.itemList[i]['sfFieldLabel'],
                voirofieldApi: this.itemList[i]['voirofieldApi'],
                voirofieldLabel: this.itemList[i]['voirofieldLabel'],
                slNo: this.itemList[i]['slNo'],
                id: this.itemList[i]['id']

            });
            // console.log('objArray  ' + JSON.stringify(objArray));

            this.finalList = [...this.finalList, { 'key': this.selectedSfObjectName, 'value': objArray }]
        }
        // this.convertToSingleJson(this.finalList)
        //  console.log('final list' + JSON.stringify(output));
        var output = [];
        this.finalList.forEach(function (item) {
            var existing = output.filter(function (v, i) {
                return v.key == item.key;
            });
            if (existing.length) {
                var existingIndex = output.indexOf(existing[0]);
                output[existingIndex].value = output[existingIndex].value.concat(item.value);
            } else {
                if (typeof item.value == 'string')
                    item.value = [item.value];
                output.push(item);
            }
        });
        //  console.log('output ' + JSON.stringify(output));
        ///////////////////

        let listwithoutemptyarray = [];

        for (let i = 0; i < this.itemList.length; i++) {
            let tempRecord = Object.assign({}, this.itemList[i]);
            if ((tempRecord['sfFieldApi'] != '') && (tempRecord['voirofieldApi'] != '')) {
                // console.log(tempRecord['sfFieldApi'])
                listwithoutemptyarray.push(tempRecord);
            }

        }

        for (let i = 0; i < listwithoutemptyarray.length; i++) {
            listwithoutemptyarray[i].id = i;
            listwithoutemptyarray[i].slNo = i + 1;
        }


        //console.log('listwithoutemptyarray ' + JSON.stringify(listwithoutemptyarray));
        /////////////////////


        insertFieldMappingJson({ fieldMappingJson: listwithoutemptyarray, FinalfieldMappingJson: output })
            .then((result) => {
                // console.log(result);
                if (result == true) {
                    const event = new ShowToastEvent({
                        title: 'Success!',
                        variant: 'success',
                        message: 'Field Mapping Saved Successfully!!!'

                    });
                    this.dispatchEvent(event);
                }
                else if (result == false) {
                    const event1 = new ShowToastEvent({
                        title: 'Failed!',
                        variant: 'error',
                        message: ' Sorry !! \n Something Went Wrong!!!'

                    });
                    this.dispatchEvent(event1);
                }
            })
            .catch((error) => {
                console.log(error);
            });

    }



}