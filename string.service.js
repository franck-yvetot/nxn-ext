class stringSce
{
    constructor() {
        this.init();
    }

    init() {
        let self=this;
        String.prototype.toCamelCase = function(upperInitial) { return self.toCamelCase(this,upperInitial); }
    }

    removeAccents(s) {
        return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    toCamelCase (str,upperInitial=false) {
        return str.replace(/^([a-z])|\s(\w)/g, function(match, p1, p2, offset) {
            if (p2) return p2.toUpperCase();
            if(upperInitial)
                return p1.toUpperCase();        
            else
                return p1.toLowerCase();        
        });
    };

}

module.exports = new stringSce();
