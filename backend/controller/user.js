function getUser(req, res){
    res.json({
        status:'success'
    })
}

module.exports = {
    getUser:getUser
}