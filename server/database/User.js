var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    link: String,
    displayName: String,
    isTeacher: Boolean,
    sentMessageIDs: [String],
    recievedMessageIDs: [String],
    groupIDs: [String],
    active: Boolean,
    auth: {
        token: String
    }
})

var UserModel = mongoose.model('User', UserSchema );


class User {

    constructor(userIn){
        this.validateUser(userIn)
        if (userIn.isTeacher ){

        }
        let defaults = {
            name: null,
            email: null,
            password: null,
            link: null,
            displayName: null,
            isTeacher: null,
            sentMessageIDs: [],
            recievedMessageIDs: [],
            groupIDs: [],
            active: false,
            auth: {
                token: null
            }
        }
        let user = {...defaults, ...userIn};
        if (!user.name){
            user.name = user.displayName;
        }
        if (!user.displayName){
            user.displayName = user.name;
        }

        // if 

    }

    validateUser(userIn){
        if (!(userIn.hasOwnProperty('name') || userIn.hasOwnProperty('displayName'))){
            throw 'Missing name or display name'
        }
        if (!userIn.hasOwnProperty('isTeacher')){
            throw 'isTeacher field is undefined'
        }
        if (userIn.isTeacher && (!userIn.email || userIn.password)){
            throw 'missing email or password'
        }
    }

    static async getUser(user){
        const query = UserModel.where(user)
        let user = await query.findOne(function (err, user) {
            if (err) {
                console.log(err);
                return null;
            };
            if (user) {
                return user;
            }
            else {
                return null;
            }
        });
        return user;
    }

    static async createUser(user){
        return User.getUser(user)
            .then(user => {
                if (user){
                    throw 'User already exists'
                }
                else {
                    new UserModel(userIn).save(()=>{
                        if (err){
                            throw err
                        }
                        else {
                            
                        }
                    })
                }
            })
    }

    static
}
