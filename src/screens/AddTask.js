import React, { Component, useState } from 'react'
import {
    Modal,
    View,
    StyleSheet,
    TouchableWithoutFeedback,
    Text,
    TouchableOpacity,
    TextInput,
    Platform
} from 'react-native'

import commonStyles from '../commonStyles'

import moment from 'moment'
import DateTimePicker from '@react-native-community/datetimepicker'

export default props => {

    const [desc, setDesc] = useState('')
    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const clearState = () => {
        setDate('')
        setDate(new Date())
        setShowDatePicker(false)
    }

    save = () => {
        const newTask = {
            desc: desc,
            date: date
        }

        //Verificando se a função onSave está sendo passada pelo o componente pai
        if (props.onSave){
            props.onSave(newTask)
        }

        clearState()
    }

    getDatePicker = () => {

        let datePicker = <DateTimePicker
            value={date}
            onChange={(event, date) => {
                setDate(date)
                setShowDatePicker(false)
            }}
            mode='date'
        />

        const dateString = moment(date).format('ddd, D [de] MMMM [de] YYYY')

        if(Platform.OS === 'android'){
            datePicker = (
                <View>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.date}>
                            {dateString}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && datePicker}
                </View>
            )
        }

        return datePicker
    }

    return (
        <Modal
            transparent={true}
            visible={props.isVisible}
            onRequestClose={props.onCancel} //Método executado ao fechar a modal
        >
            <TouchableWithoutFeedback onPress={props.onCancel}>
                <View style={styles.background}>

                </View>
            </TouchableWithoutFeedback>

            <View style={styles.container}>

                <Text style={styles.header}>Nova Tarefa</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Informe a Descrição...'
                    value={desc}
                    onChangeText={desc => setDesc(desc)}
                //OBS: O componente não consegue alterar o state, e sim o state que consegue alterar o componente
                //Por esse motivo utilizamos o onChangeText que fica escutando as alterações no componente, a partir disso atribuimos o valor ao state que no final das contas altera o componente
                />

                {getDatePicker()}

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={props.onCancel}>
                        <Text style={styles.button}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={save}>
                        <Text style={styles.button}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableWithoutFeedback onPress={props.onCancel}>
                <View style={styles.background}>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    container: {
        backgroundColor: '#FFF',
    },
    header: {
        fontFamily: commonStyles.fontFamily,
        backgroundColor: commonStyles.colors.today,
        color: commonStyles.colors.secondary,
        textAlign: 'center',
        padding: 15,
        fontSize: 18
    },
    input: {
        fontFamily: commonStyles.fontFamily,
        height: 40,
        margin: 15,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E3E3E3',
        borderRadius: 6
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    button: {
        margin: 20,
        marginRight: 30,
        color: commonStyles.colors.today
    },
    date: {
        fontFamily: commonStyles.fontFamily,
        fontSize: 20,
        margin: 15
    }
})