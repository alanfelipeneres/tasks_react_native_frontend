import React, { Component } from 'react'
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Platform,
    Alert
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/pt-br' //Traduzindo as datas para Português
import AsyncStorage from '@react-native-community/async-storage'

import { server, showError } from '../common'
import todayImage from '../../assets/imgs/today.jpg'
import tomorrowImage from '../../assets/imgs/tomorrow.jpg'
import weekImage from '../../assets/imgs/week.jpg'
import monthImage from '../../assets/imgs/month.jpg'
import commonStyles from '../commonStyles'
import Task from '../components/Task'
import AddTask from './AddTask'


const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks: []
}

export default class TaskList extends Component {



    state = {
        ...initialState
    }

    //MÉTODO DO CICLO DE VIDA que é executado quando os componentes são montados
    componentDidMount = async () => {
        //this.filterTasks()
        const stateString = await AsyncStorage.getItem('tasksState')
        const savedState = JSON.parse(stateString) || initialState
        this.setState({
            showDoneTasks: savedState.showDoneTasks
        }, this.filterTasks)

        this.loadTasks()
    }

    loadTasks = async () => {
        try {
            //const maxDate = moment().format('YYYY-MM-DD HH:mm:ss') //obtendo a data com 23:59
            const maxDate = moment()
                .add(this.props.daysAhead, 'days')
                .format('YYYY-MM-DD 23:59:59') //obtendo a data com 23:59
            //console.warn(maxDate)

            const res = await axios.get(`${server}/tasks?date=${maxDate}`)
            this.setState({ tasks: res.data }, this.filterTasks)
        } catch (e) {
            showError(e)
        }
    }

    toggleTask = async taskId => {
        // const tasks = [...this.state.tasks]

        // tasks.forEach(task => {
        //     if (task.id == taskId) {
        //         task.doneAt = task.doneAt ? null : new Date()
        //     }
        // })

        // // O método setState recebe 2 parâmetros o 1º é o valor a ser atualizado no state 
        // // e o 2º é uma função de callback que será executada a após a atualização do objeto no state
        // this.setState({ tasks: tasks }, this.filterTasks)

        try {
            await axios.put(`${server}/tasksToggle/${taskId}/toggle`)
            this.loadTasks()
        } catch (error) {
            showError(error)
        }
    }

    toggleFilter = () => {
        // O método setState recebe 2 parâmetros o 1º é o valor a ser atualizado no state 
        // e o 2º é uma função de callback que será executada a após a atualização do objeto no state
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if (this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks]
        } else {
            const pending = task => task.doneAt === null //Método criado para filtrar apenas as tasks pendentes
            visibleTasks = this.state.tasks.filter(pending)
        }

        this.setState({ visibleTasks: visibleTasks })

        AsyncStorage.setItem('tasksState', JSON.stringify({
            showDoneTasks: this.state.showDoneTasks
        }))
    }

    addTask = async newTask => {
        if (!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados Inválidos', 'Descrição não informada!')
            return
        }

        // const tasks = [...this.state.tasks]
        // tasks.push({
        //     id: Math.random(),
        //     desc: newTask.desc,
        //     estimateAt: newTask.date,
        //     doneAt: null
        // })

        try {
            await axios.post(`${server}/tasks`, {
                desc: newTask.desc,
                estimateAt: newTask.date
            })

            this.setState({ showAddTask: false, }, this.loadTasks)
        } catch (error) {
            showError(error)
        }
    }

    deleteTask = async taskId => {
        // const tasks = this.state.tasks.filter(task => task.id !== id)
        // this.setState({ tasks }, this.filterTasks) //Pelo o fato de no state já existir um objeto como nome tasks não é necessário fazer a atribuição direta tasks: tasks

        try {
            await axios.delete(`${server}/tasks/${taskId}`)
            this.loadTasks()
        } catch (error) {
            showError(error)
        }
    }

    getImage = () => {
        switch (this.props.daysAhead) {
            case 0: return todayImage
            case 1: return tomorrowImage
            case 7: return weekImage
            case 30: return monthImage
            default: return monthImage
        }
    }

    getColor = () => {
        switch (this.props.daysAhead) {
            case 0: return commonStyles.colors.today
            case 1: return commonStyles.colors.tomorrow
            case 7: return commonStyles.colors.week
            case 30: return commonStyles.colors.month
            default: return commonStyles.colors.month
        }
    }

    //Ao criar um componente baseado em class é necessário utilizar o método render
    render() {

        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')

        return (
            <View style={styles.container}>
                <AddTask
                    isVisible={this.state.showAddTask}
                    onCancel={() => this.setState({ showAddTask: false })}
                    onSave={this.addTask}
                />
                <ImageBackground
                    source={this.getImage()}
                    style={styles.background}
                >
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={() => this.props.navigation.openDrawer()}>
                            {/* Ícone para apresenta o menu */}
                            <Icon
                                name='bars'
                                size={20}
                                color={commonStyles.colors.secondary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.toggleFilter}>
                            {/* Ícone que apresenta ou inibe as tasks concluídas */}
                            <Icon
                                name={this.state.showDoneTasks ? 'eye' : 'eye-slash'}
                                size={20}
                                color={commonStyles.colors.secondary}
                            />
                        </TouchableOpacity>
                    </View>


                    <View style={styles.titleBar}>
                        <Text style={styles.title}>{this.props.title}</Text>
                        <Text style={styles.subtitle}>{today}</Text>
                    </View>
                </ImageBackground>

                <View style={styles.taskList}>
                    {/* O FlatList é utilizado para dar a possibilidade de rolar a tela */}
                    <FlatList
                        data={this.state.visibleTasks}
                        keyExtractor={item => `${item.id}`}
                        renderItem={({ item }) => <Task {...item} onToggleTask={this.toggleTask} onDelete={this.deleteTask} />} //O spread (...item) faz com que todos as propriedades do objeto item sejam passados para o componente Task. Ex de propriedades: estimateAt, doneAt
                    />

                    {/* <Task 
                        desc='Comprar Livro' 
                        estimateAt={new Date()} 
                        doneAt={new Date()} />
                    <Task 
                        desc='Ler Livro' 
                        estimateAt={new Date()} 
                        doneAt={null} /> */}
                </View>

                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: this.getColor() }]}
                    onPress={() => this.setState({ showAddTask: true })}
                    activeOpacity={0.7}
                >
                    <Icon
                        name='plus'
                        size={20}
                        color={commonStyles.colors.secondary}
                    />
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    background: {
        flex: 3
    },
    taskList: {
        flex: 7
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    title: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subtitle: {
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30
    },
    iconBar: {
        flexDirection: 'row',
        marginHorizontal: 20,
        justifyContent: 'space-between',
        marginTop: Platform.OS == 'ios' ? 40 : 10
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center'
    }
})