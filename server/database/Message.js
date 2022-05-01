
class Message {
    constructor (contents, senderID, groupID){
        this.contents = contents
        this.senderID = senderID
        this.groupID = groupID
        this.sentTime = Date.now()
    }
}