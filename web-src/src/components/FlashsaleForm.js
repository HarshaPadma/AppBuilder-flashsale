/*
* <license header>
*/

import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
    Flex,
    Heading,
    Form,
    Picker,
    ActionButton,
    Item,
    Text,
    View
} from '@adobe/react-spectrum'
import Function from '@spectrum-icons/workflow/Function'

import allActions from '../config.json'
import axios from "axios";
import { EditorState, ContentState } from 'draft-js';
import actionWebInvoke from '../utils'

// remove the deprecated key
const actions = Object.keys(allActions).reduce((obj, key) => {
    if (key.lastIndexOf('/') > -1) {
        obj[key] = allActions[key]
    }
    return obj
}, {})

const FlashsaleForm = (props) => {
    const [state, setState] = useState({
        storeviewSelected: null,
        categorySelected: null,
        imageSelected: ''
    })
    const [selectedStartDateTime, setSelectedStartDateTime] = useState('');
    const [selectedEndDateTime, setSelectedEndDateTime] = useState('');
    const handleStartDateChange = event => {
        const selectedStartDateTimeValue = event.target.value;
        const selectedStartDateTimeObj = new Date(selectedStartDateTimeValue);
        const currentDateTime = new Date();
        if (selectedStartDateTimeObj > currentDateTime) {
            setSelectedStartDateTime(selectedStartDateTimeValue);
        } else {
            alert('Select date and time greater than current value!');
            // Reset the input value
            event.target.value = selectedStartDateTime;
        }
    };
    const handleEndDateChange = event => {
        const selectedEndDateTimeValue = event.target.value;
        const selectedEndDateTimeObj = new Date(selectedEndDateTimeValue);
        const startDateTimeObj = new Date(selectedStartDateTime);

        // Extract date and time components separately
        const endDate = new Date(selectedEndDateTimeObj.getFullYear(), selectedEndDateTimeObj.getMonth(), selectedEndDateTimeObj.getDate());
        const endTime = selectedEndDateTimeObj.getHours() * 3600 + selectedEndDateTimeObj.getMinutes() * 60 + selectedEndDateTimeObj.getSeconds();

        const startDate = new Date(startDateTimeObj.getFullYear(), startDateTimeObj.getMonth(), startDateTimeObj.getDate());
        const startTime = startDateTimeObj.getHours() * 3600 + startDateTimeObj.getMinutes() * 60 + startDateTimeObj.getSeconds();

        // Check if end date is greater than or equal to start date
        // and end time is greater than start time
        if (endDate > startDate || (endDate.getTime() === startDate.getTime() && endTime > startTime)) {
            setSelectedEndDateTime(selectedEndDateTimeValue);
        } else {
            alert('Select date and time greater than or equal to start value!');
            // Reset the input value
            event.target.value = selectedEndDateTime;
        }
    };
    const imageUpload = event => {
        const file = event.target.files[0]; // Get the first file selected
        if (file) {
            const fileName = file.name;
            const fileType = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            const timeStamp = new Date().toJSON();
            const fileNameFull = fileName.substring(0, fileName.lastIndexOf('.'))+'_'+timeStamp;
            if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {
                setState({ ...state, imageSelected: fileNameFull });
            } else {
                alert('Please upload an image of JPEG or PNG or GIF format.');
            }
        }
    };
    const [text, setText] = useState('');
    // const contentState = ContentState.createFromText('Hello');
    const [editorState, setEditorState] = useState(
        () => EditorState.createEmpty(),
    );
    const newEditorState = EditorState.set(editorState, {
        allowUndo: false,
    });
    const onEditorStateChange = (editorState) => {
        setEditorState(editorState);
    };
    // async function fetchData() {
    //     // Fetch data
    //     const { data } = await axios.get("https://app.dyson.test/rest/V1/");
    //     const results = []
    //     // Store results in the results array
    //     data.forEach((value) => {
    //         results.push({
    //             key: value.name,
    //             value: value.id,
    //         });
    //     });
    //     // Update the options state
    //     setOptions([
    //         {key: 'Select a company', value: ''},
    //         ...results
    //     ])
    // }
    const storeViews = {
        0: 'All Store Views',
        1: 'Store-1',
        2: 'Store-2',
    };
    const categories = {
        0: 'All Categories',
        1: 'Category-1',
        2: 'Category-2',
    };
    return (
        <View width="size-6000">
            <Heading level={1}>Flashsale Settings</Heading>
            {Object.keys(storeViews).length > 0 && (
                <Form necessityIndicator="label">
                    <Picker
                        label="Select Store View"
                        isRequired={true}
                        placeholder="select store-view"
                        aria-label="select store-view"
                        items={Object.keys(storeViews).map((k) => ({ name: storeViews[k], value: k }))}
                        itemKey="name"
                        onSelectionChange={(name) =>
                            setState({
                                ...state,
                                storeviewSelected: name
                            })
                        }
                    >
                        {(item) => <Item key={item.name}>{item.name}</Item>}
                    </Picker>
                    <p>Event Start From (required)</p>
                    <input aria-label="Event Start From" type="datetime-local"
                           required={true}
                    onChange={handleStartDateChange}/>
                    <p>Event End (required)</p>
                    <input aria-label="Event End" type="datetime-local"
                    onChange={handleEndDateChange}
                           required={true}/>
                    <p>Description (optional)</p>
                    <Editor
                        editorState={editorState}
                        editorStyle={{ backgroundColor: 'white',border: '1px solid #ccc', borderRadius: '5px' }}
                        onEditorStateChange={onEditorStateChange}
                    />
                    <div style={{ height: '10px' }}></div>
                    <input type="file" accept="image/*" required={true} onChange={imageUpload}/>
                    <Flex>
                        <ActionButton
                            variant="primary"
                            type="button"
                            onPress={invokeAction.bind(this)}
                            isDisabled={!state.imageSelected}
                        ><Function aria-label="Invoke" /><Text>Upload Banner</Text></ActionButton>
                    </Flex>
                    <Picker
                        label="Select Category"
                        isRequired={true}
                        placeholder="select category"
                        aria-label="select category"
                        items={Object.keys(categories).map((k) => ({ name: categories[k], value: k }))}
                        itemKey="name"
                        onSelectionChange={(name) =>
                            setState({
                                ...state,
                                categorySelected: name
                            })
                        }
                    >
                        {(item) => <Item key={item.name}>{item.name}</Item>}
                    </Picker>
                    <Flex>
                        <ActionButton
                            variant="primary"
                            type="button"
                            onPress={invokeAction.bind(this)}
                            isDisabled={!state.categorySelected}
                        ><Function aria-label="Invoke" /><Text>Save</Text></ActionButton>
                    </Flex>
                </Form>
            )}
        </View>
    )

    // invokes a the selected backend actions with input headers and params
    async function invokeAction () {
        alert('hi');
    }
}
FlashsaleForm.propTypes = {
    runtime: PropTypes.any,
    ims: PropTypes.any
}

export default FlashsaleForm