const tcKimlikKontrol = require("./tcKontrol");

function tcDogrulama(req, res, next){
    const { tc } = req.body;
    if (!tcKimlikKontrol(tc)) {
        return res.status(400).json({ error: "Geçersiz TC Kimlik Numarası" });
    }
    next();
}
module.exports = tcDogrulama;