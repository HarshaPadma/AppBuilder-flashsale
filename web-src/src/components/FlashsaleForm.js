/*
* <license header>
*/

import React, {useEffect, useState} from 'react'
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
import {forEach} from "core-js/internals/array-iteration";

// remove the deprecated key
const actions = Object.keys(allActions).reduce((obj, key) => {
    if (key.lastIndexOf('/') > -1) {
        obj[key] = allActions[key]
    }
    return obj
}, {})

const FlashsaleForm = (props) => {
    useEffect(() => {
        fetchCategoryData()
            .catch(error => {
                console.error('Error fetching data:', error);
            });
        fetchStoreData()
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);
    const [state, setState] = useState({
        storeviewSelected: null,
        categorySelected: null,
        imageSelected: ''
    })
    const [results, setResults] = useState([]);
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
            alert('Select date and time greater than start value!');
            // Reset the input value
            event.target.value = selectedEndDateTime;
        }
    };
    const [image, setImage] = useState();

    const imageUpload = event => {
        const file = event.target.files[0]; // Get the first file selected
        setImage(URL.createObjectURL(file));
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
    const [stores, setStores] = useState([]);
    //added

    //added
    function buildFlattenedArray(items, parentPath, depth) {
        const children = items.filter(item => item.path.startsWith(parentPath + '/') && item.path.split('/').length === parentPath.split('/').length + 1);

        if (children.length === 0) {
            return [];
        }

        const flattenedArray = [];
        children.forEach(child => {
            flattenedArray.push('--'.repeat(depth) + child.name);
            const nestedChildren = buildFlattenedArray(items, child.path, depth + 1);
            flattenedArray.push(...nestedChildren);
        });

        return flattenedArray;
    }
    async function fetchCategoryData() {
        const response = await fetch("https://master-7rqtwti-sgwkmfw5dcndm.ap-4.magentosite.cloud/graphql?query=%7B%0A%20%20categories(filters%3A%20%7B%7D%2C%20pageSize%3A%2020%2C%20currentPage%3A%201)%20%7B%0A%20%20%20%20items%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20path%0A%20%20%20%20%20%20level%0A%20%20%20%20%23%20children%20%7B%0A%20%20%20%20%23%20%20%20name%0A%20%20%20%20%23%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20total_count%0A%20%20%7D%0A%7D%0A&variables=%7B%7D", {
            mode: 'cors'
        });
        const results = await response.json();
        const parentPath = "1/2";
        const flattenedArray= buildFlattenedArray(results['data']['categories']['items'], parentPath, 1);
        console.log(flattenedArray)
        // const level = 2;
        // const a = results['data']['categories']['items'].filter((item) => item.level === level && item.path.startsWith(path));
        // console.log(a);
        // const newOptions = flattenedArray.map((item, index) => ({ label: item, value: index.toString() }));
        // const newOptions = results['data']['categories']['items'].map((item, index) => ({
        //     name: item.name+' ('+item.path+')',
        //     // name: item.name+' ('+item.path+')'+'-'.repeat(item.level-1),
        //     value: index.toString()
        // }));

        setResults(flattenedArray);
        // console.log(newOptions);
    }
    async function fetchStoreData() {
        const response = await fetch("https://master-7rqtwti-sgwkmfw5dcndm.ap-4.magentosite.cloud/graphql?query=query%20%7B%0A%20%20availableStores(useCurrentGroup%3A%20true)%20%7B%0A%20%20%20%20store_code%0A%20%20%20%20store_name%0A%20%20%20%20%7D%0A%7D%0A&variables=%7B%7D", {
            mode: 'cors'
        });
        const results = await response.json();
        const newOptions = results['data']['availableStores'].map((item) => ({ name: item.store_name, value: item.store_code}));
        setStores(newOptions);
        console.log(newOptions);
    }
    return (
        <View width="size-6000">
            <Heading level={1}>Flashsale Settings</Heading>
            {Object.keys(stores).length > 0 && (
                <Form necessityIndicator="label">
                    <label htmlFor="options">Select a Store View</label>
                    <Picker
                        label="Select Store View"
                        isRequired={true}
                        placeholder="select store-view"
                        aria-label="select store-view"
                        items={stores}
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
                    <img src={image} style={{ maxWidth: '200px', maxHeight: '200px' }} />
                    <label htmlFor="options">Select a category</label>
                    <div>
                        <select id="options" style={{padding: '6px', width:"470px"}} onChange={(name) =>
                            setState({
                                ...state,
                                categorySelected: name
                            })
                        }>
                            <option value="">Select category</option>
                            {results.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <Flex>
                        <ActionButton
                            variant="primary"
                            type="button"
                            onPress={invokeAction}
                            isDisabled={!state.categorySelected}
                        ><Function aria-label="Invoke" /><Text>Save</Text></ActionButton>
                    </Flex>
                </Form>
            )}
        </View>
    )

    // invokes a the selected backend actions
    function invokeAction () {
        alert('Saved!!!');
    }
}
FlashsaleForm.propTypes = {
    runtime: PropTypes.any,
    ims: PropTypes.any
}

export default FlashsaleForm