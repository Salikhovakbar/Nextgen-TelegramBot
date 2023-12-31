import TelegramBot from "node-telegram-bot-api";
import dotenv from 'dotenv'
dotenv.config() 
import survey from '../questions/survey.js' 
import fetch from 'node-fetch'
const bot = new TelegramBot(process.env.TOKEN, {polling: true})
const admin = process.env.ADMIN
const user = {}
const languages = ['🇷🇺 Русский', "🇺🇿 Uzbek"]
const hosting = 'http://localhost:5000'
const funct = async () => {
    const response = await fetch(hosting + '/new/students',{
        method: 'GET'
    }
    )
    const data = await response.json()
    if(data.data.length > 0){ 
        data.data.forEach(async e => {
           await bot.sendMessage(admin, sendMessage(e),{
            reply_markup: {
                inline_keyboard: [
                    [{text: '✅', callback_data: 'done'}]
                ]
            }
           })
        const res = await fetch( hosting + `/new/students/${e._id}`,{
            method: "DELETE"
        })
        }
    )}
    }
setInterval(funct, 3000)
bot.onText(/\/start/, async msg => {
    try {
        const { id } = msg.from
    await bot.sendMessage(id, `Hello ${msg.from.first_name || msg.from.last_name}
Что-бы продолжить пожалуйста выберите язык 🇷🇺 что-бы записаться на наши курсы английского языка (Nextgen) 📚📖📕 

Davom etish uchun ingliz tili kurslariga (Nextgen) 📚📖📕 yozilish uchun tilni 🇺🇿 tanlang 
    `, {
        reply_markup: {
            keyboard: [
                [{text: '🇺🇿 Uzbek'}, {text: '🇷🇺 Русский'}]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    })  
    } catch (err) {
        console.log(err.message)
    }
})

let count = 0


async function* generator(){
    while(true){
        let [id, question] = yield
    if(question == 'Вы изучали англиский 🏴󠁧󠁢󠁥󠁮󠁧󠁿🇺🇸 , когда нибудь? если так то напишиите свой уровень или выберите "Beginner"' || question == `Siz qachon dir ingliz tilini 🏴󠁧󠁢󠁥󠁮󠁧󠁿🇺🇸 oʻrganganmisiz? agar shunday bo'lsa, darajangizni yozing yoki "Beginner" tanlang`) await bot.sendMessage(id, question, {
        reply_markup: {
            keyboard: [
                [{text: 'Beginner'}, {text: 'Elementary'}],
                [{text: 'Pre-intermediate'}, {text: 'Intermediate'}],
                [{text: 'IELTS'}]
            ], resize_keyboard: true, one_time_keyboard: true
        }
    })
        else await bot.sendMessage(id, question)
    }
}

const genfun = generator()
genfun.next()
bot.on('message', async msg => {
try {
    const { id } = msg.from
    if(msg.from.is_bot || msg.text == '/start') return ;
if(!user[id] || languages.includes(msg.text)){
     count = 0
     user[id]=[]
     await bot.sendMessage(id, msg.text == "🇺🇿 Uzbek" ? "Keling, so'rovimizni boshlaymiz va Nextgen oilasining 👨‍👨‍👦‍👦 bir qismi bo'lamiz": 'Давайте начнем наш опрос и станем частью семьи 👨‍👨‍👦‍👦 Nextgen')
    }
    user[id].push(msg.text)
if(count < survey.find(e => e.language.toLowerCase() == user[id][0].toLowerCase()).data.length) genfun.next([id, survey.find(e => e.language.toLowerCase() == user[id][0].toLowerCase()).data[count++]])
else{ await bot.sendMessage(id, `
Users information 👤

Student🎓: ${user[id][1]}
Age🔢: ${user[id][2]}
Contact📞: ${user[id][3]}
Level📊: ${user[id][4]}

Application written ✍️ by ${'@' + msg.from.username || user[id][1]}
ID: ${id}
`, {
    reply_markup: {
        inline_keyboard: [
            [{text: '✅', callback_data: 'yes'}, {text: '❌', callback_data: 'no'}]
        ]
    }
})
if(user[id][0] == '🇺🇿 Uzbek') return await bot.sendMessage(id, 'Kiritilgan malumot 👆 togrimi ℹ️✅?')
else return await bot.sendMessage(id, 'Ваша информация 👆 правильная ?')
}
} catch (err) {
    console.log(err.message)
}
})

bot.on('callback_query', async msg => {
    try {
        const { id } = msg.from
        // console.log(msg.message)
        await bot.deleteMessage(msg.from.id,msg.message.message_id) 
        if(msg.data == 'yes'){
    if(id == admin){
        await bot.sendMessage(msg.message.text.split(' ')[msg.message.text.split(' ').length - 1], `Ваша Регистрация была подтверждена админом ✅, Nextgen поздравляет вас 🥳🎉!\nSizning ro'yxatdan o'tganingiz admin tomonidan tasdiqlangan, Nextgen sizni tabriklaydi 🥳🎉!`)
    }
    else{
        await bot.sendMessage(admin, msg.message.text, {
            reply_markup: {
                inline_keyboard: [
                    [{text: '✅', callback_data: 'yes'}, {text: '❌', callback_data: 'no'}]
                ]
            }
        })
        await bot.sendMessage(id, user[id][0] == '🇺🇿 Uzbek'? `Sizning malumotlaringiz adminga jonatildi 👨‍🎓👤☑️\nYaqin orada sizga aloqaga chiqamiz ⏳🤙📞` : 'Ваша информация была отправлена админу 👨‍🎓👤☑️\nСкоро наши админы свяжутся с вами ⏳🤙📞' )
    }
  } else if(msg.data == 'no'){ 
    if(id == admin){
        await bot.sendMessage(msg.message.text.split(' ')[msg.message.text.split(' ').length - 1], `Ваша Регистрация не была подтверждена админом ⛔️🚫😢! \nSizning ro'yxatdan o'tganingiz admin tomonidan tasdiqlanmadi ⛔️🚫😢!`)
        await bot.deleteMessage(msg.from.id,msg.message.message_id)
    }
}
else if(msg.data == 'done'){
    if(id == admin)  await bot.deleteMessage(msg.from.id,msg.message.message_id)

}
    } catch (err) {
        console.log(err.message)
    }
})


function sendMessage(data){
let str = ''
    for(let i in data){
if(i !="_id")str+=`\n${i}: ${i == 'telephone'?'+998' + data[i]:data[i]}`
}
return str
}