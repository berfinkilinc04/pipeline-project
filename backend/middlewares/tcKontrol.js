function tcKimlikKontrol(tc){
    if(!tc || typeof tc!== "string" || tc.length !== 11) return false;
    if(!/^[0-9]{11}$/.test(tc)) return false;
    if (tc[0]=== "0")return false;

    const rakamlar = tc.split("").map(Number);

    const tekToplam = rakamlar[0] + rakamlar[2] + rakamlar[4] + rakamlar[6] + rakamlar[8];
    const ciftToplam = rakamlar[1] + rakamlar[3] + rakamlar[5] + rakamlar[7];

    const onuncuRakam = ((tekToplam * 7) - ciftToplam) % 10;
    const ilkOnRakamToplam = rakamlar.slice(0,10).reduce((a,b) => a+b, 0);
    const onBirinciRakam = ilkOnRakamToplam % 10;

    console.log({ tc, tekToplam, ciftToplam, onuncuRakam, beklenen10: rakamlar[9], ilkOnRakamToplam, onBirinciRakam, beklenen11: rakamlar[10] });

    if (onuncuRakam !== rakamlar[9]) return false;
    if (onBirinciRakam !== rakamlar[10]) return false;

    return true;

}
module.exports = tcKimlikKontrol;
