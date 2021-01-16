import moment from 'moment';
import {
    Matches, IsInt, IsEnum, IsDate, IsString} from 'class-validator';
import { RucType, TipoAmbiente, TipoEmision, TipoRuc } from './models';
const checkdigit = require('checkdigit');

export class CUFE {
    constructor() {

    }

    @IsString()
    public iDoc: string;

    @IsEnum(TipoRuc)
    public dTipoRuc: TipoRuc;

    @IsEnum(RucType)
    public dRUC: RucType;


    @IsInt()
    public dDV: number;

    @IsString()
    public dSucEm: string;

    @IsDate()
    public dFechaEm: Date;

    @Matches('^(?=.*[1-9].*)[0-9]{10}$')
    public dNroDF: string;

    /**
     *             B08: Punto de Facturación del documento fiscal. La serie sirve para permitir que existan secuencias independientes de numeración de facturas, con diversas finalidades, sea por libre elección del emisor, tales como puntos de facturación distintos (como cajas de un supermercado, o bodegas de un distribuidor), tipos de productos, especies de operación, etc., sea para finalidades que vengan  a ser determinadas por la DIRECCIÓN GENERAL DE INGRESOS.
     */
    @Matches('^^(?=.*[1-9].*)[0-9]{3}$')
    public dPtoFacDF: string;


    /**
     * Ambientes de destino de la FE
     */
    @IsEnum(TipoAmbiente)
    public iAmb: TipoAmbiente;

    /**
     * Tipo de Emision
     */
    @IsEnum(TipoEmision)
    public iTpEmis: TipoEmision;

    @IsString()
    public dSeg: string;
}


export class CUFEBuilder {
    cufeSequence = '0'.repeat(64);
    constructor(
        private cufe: CUFE
    ) {

    }

    /**
     * turns to ascii
     * @param val 
     */
    asciify(val: string) {
        let arr = [];
        for (let i = 0;i < val.length; i++) {
            let char  = parseInt(val.charAt(i), 10);
            if (['0','1','2','3','4','5','6','7','8','9'].indexOf(val.charAt(i)) === -1){
                char = val.charCodeAt(i);
            }
            
            if (char > 9) {
                arr = [parseInt(char.toFixed().substring(1, 2), 10), ...arr];
            } else {
                arr = [char, ...arr];
            }    
        }
        return arr.reverse().join('');
    }

    /**
     * creates a cufe
     * @param securityCode security code
     */
    create(securityCode?: any) {
        // securityCode = securityCode || Math.floor(Math.random()*10e8);
        // tipo documento
        const tipoDocumento = this.cufe.iDoc.toString().padStart(2, '0');

        // tipo contribuyente
        const tipoContribuyente = this.cufe.dTipoRuc.toString();
    
        // ruc
        const ruc = this.cufe.dRUC.dRuc;

        // dv
        const dv = this.cufe.dRUC.dDV.padStart(
            this.cufe.dRUC.dDV.length + 1,
            '-'
        );

        // cod sucursal
        const codSucursal = this.cufe.dSucEm.padStart(4, '0');

        // fecha
        const fechaEmision = moment(this.cufe.dFechaEm).format('YYYYMMDD');

        // nro df
        const nrodf = this.cufe.dNroDF.padStart(10, '0');
        
        // ptr fac
        const ptofac = this.cufe.dPtoFacDF.padStart(3, '0');
        const tipoEmis = this.cufe.iTpEmis.padStart(2, '0');
        // const dseg = Math.floor(Math.random()*10e8);

        this.cufeSequence = [
            tipoDocumento,
            tipoContribuyente,
            ruc,
            dv,
            codSucursal,
            fechaEmision,
            nrodf,
            ptofac,
            tipoEmis,
            this.cufe.iAmb,
            securityCode
        ].join('');


        const mod10 = this.asciify(this.cufeSequence);        
        const digit = checkdigit.mod10.create(mod10);        

        return { cufe: this.cufeSequence, dv: digit };
    }
}