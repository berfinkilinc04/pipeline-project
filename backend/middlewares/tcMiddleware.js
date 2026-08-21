const tcKimlikKontrol = require("./tcKontrol");

function tcDogrulama(req, res, next){
    const { tc_kimlik_no } = req.body;
    if (!tcKimlikKontrol(tc_kimlik_no)) {
        return res.status(400).json({ error: "Geçersiz TC Kimlik Numarası" });
    }
    next();
}
module.exports = tcDogrulama;