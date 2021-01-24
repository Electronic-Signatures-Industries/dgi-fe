# IFESA DGI Facturacion Electronica


`npm i ifesa-dgi-factura-electronica`

### Features


- Supports for XmlDsig signatures
- CUFE Generator
- Most of the XSD Schemas imported into Typescript with `class-validator` decorators
- Easy transform between Javascript Object, JSON, XML.
- GUI enabled with commercial license

### API

### fe namespace

#### Core

```typescript
    // Invoice info
    const gDGen = <DGen>{
      ...Plantillas.Pruebas,
      ...Plantillas.PruebasFechas(new Date(2020, 9, 9)),
      ...Plantillas.TodoElectronicoLocal,
      dNroDF: '2598274063',
      dPtoFacDF: '930',
      dSeg: '672958054',
      iNatOp: TipoNaturalezaOperacion.Venta,
      iTipoOp: TipoOperacion.Compra,
      iTipoTranVenta: TipoTransaccionVenta.Giro,
      // Issuer
      gEmis: {
        gRucEmi: {
          dTipoRuc: TipoRuc.Juridico,
          dRuc: '29-29-29',
          dDV: '56'
        },
        dNombEm: '',
        dSucEm: '7632',
        dCoordEm: '+8.9892,-79.5201',
        gUbiEm: {
          dCodUbi: Ubicaciones['BOCAS DEL TORO-BOCAS DEL TORO-BASTIMENTOS'],
        },
        dDirecEm: 'Calle 50',
        dTfnEm: ['66731138'],
      },
      // Receiver
      gDatRec: {
        iTipoRec: TipoReceptor.Contribuyente,
        gRucRec: {
          dTipoRuc: TipoRuc.Juridico,
          dRuc: '29-29-29',
          dDV: '56'
        },
        cPaisRec: Paises.PANAMA,
        dNombRec: '',
        gUbiRec: {
          dCodUbi: Ubicaciones['PANAMA OESTE-ARRAIJAN-CERRO SILVESTRE'],
        },
        dDirecRec: 'Calle 50',
        dTfnRec: ['66731138'],
      },
      gAutXML: [{
        gRucAutXML: {
          dTipoRuc: TipoRuc.Juridico,
          dRuc: '29-29-29',
          dDV: '56'
        },
      }]
    };

    // Items
    const gItem: Item[] = [
      {
        dSecItem: 1,
        dDescProd: 'Servicios profesionales Abril Mayo 2020 relacionado a desarrollo web',
        cCantCodInt: 1,
        cUnidad: Unidades['Actividad: una unidad de trabajo o acción'],
        dInfEmFE: 'No reembolsable',
        gPrecios: {
          dPrItem: 500,
          dPrUnit: 500,
          dValTotItem: 500
        },
        gITBMSItem: {
          dTasaITBMS: TasaITBMS.TasaExonerado,
          dValITBMS: 0
        }
      }, {
        dSecItem: 2,
        dDescProd: 'Investigacion de algoritmo para firmar una factura electronica',
        cCantCodInt: 1,
        dCodCPBSabr: CatBienes['Servicios de Gestión, Servicios Profesionales de Empresa y Servicios Administrativos'],
        dCodCPBScmp: DescBienes.Software,
        dInfEmFE: 'Probablemente posible',
        gPrecios: {
          dPrItem: 500,
          dPrUnit: 500,
          dValTotItem: 500
        },
        gITBMSItem: {
          dTasaITBMS: TasaITBMS.TasaExonerado,
          dValITBMS: 0
        }
      }
    ];

    // Totals
    const gTot: Totales = {
      dNroItems: 1,
      dTotGravado: 1000,
      dTotITBMS: 0,
      dTotNeto: 1000,
      dTotRec: 0,
      dVTot: 1000,
      dVTotItems: 1,
      dVuelto: 0,
      iPzPag: TiempoPago.Plazo,
      gFormaPago: [{
        iFormaPago: FormaPago.Otro,
        dVlrCuota: 1
      }]
    };

    const rfe = FEBuilder
      .create()
      .rFE({
        // CUFE, hardcoded
        dId: 'FE01200000000000029-29-29-5676322018101525982740639300126729580548',
        dVerForm: 1.00,
        gDGen,
        gItem,
        gTot,
      });
    
    // Object to XML
    const res = await rfe.toXml();
    latestFEDocument = res;
    feDoocument = rfe;
    expect(res).equal(testMatch);
```

#### CUFE
```typescript
    it("should be able to create a CUFE", async function () {
        const testMatch = '011000008-PE-3824-00523-2800012017071500000151340010117450183432';
        const cufe = new CUFE();
        cufe.iAmb = TipoAmbiente.Produccion;
        cufe.dFechaEm = new Date(2017, 6, 15);
        cufe.iTpEmis = TipoEmision.UsoPrevioOpsNormal.replace('0', '');
        const gRucEmi = {
            dTipoRuc: TipoRuc.Natural,
            dRuc: '000008-PE-3824-00523',
            dDV: '28'
        };

        cufe.iDoc = TipoDocumento.FacturaOpsInterna.replace('0', '');
        cufe.dDV = 28;
        cufe.dSucEm = '0001';
        cufe.dRUC = gRucEmi;
        cufe.dTipoRuc = TipoRuc.Natural;
        cufe.dPtoFacDF = '1';
        cufe.dNroDF = '15134';
        cufe.dSeg = '745018343';
        const cufeBuilder = new CUFEBuilder(cufe);
        const res = cufeBuilder.create('745018343');

        expect(`FE${res.cufe}${res.dv}`).equal(`FE${testMatch}`);
        expect(res.cufe.length).equal(63);
    });

    it("should be able to sign with RSA Key pair", async function () {
        const issuer: X509Info = {
            stateOrProvinceName: 'PA',
            organizationName: 'RM',
            organizationalUnitName: 'Engineering',
            commonName: 'Rogelio Morrell',
            countryName: 'Panama',
            localityName: 'Panama'
        };
        const rsaKey = await Wallet.getRSA256Standalone();

        const rsaKeyExports = await KeyConvert.getX509RSA(rsaKey);
        const selfSignedCert = X509.createSelfSignedCertificateFromRSA(
            rsaKeyExports.pemAsPrivate, rsaKeyExports.pemAsPublic, issuer);
        try {
            const signedDocuments = await XmlDsig.signFEDocument(rsaKeyExports.pemAsPrivate, selfSignedCert, latestFEDocument);
            expect(!!signedDocuments.json).equals(true)
            expect(!!signedDocuments.xml).equals(true)
        } catch (e) {
            console.log(e);
        }
    });

```

### dv namespace

- Digito Verificador for RUC Natural Person based on algorithm from DGI. 
- Client that calls a read only function in a Solidity smart contract

##### Usage

```typescript
        const nodeUrl = '...node url';
        const isMainnet = true;
        const account = '...your ethereum accpunt';

        const dv = new DV(account, nodeUrl, isMainnet);
        
        // initialize contracts
        await dv.initialize();
        
        // call calculate
        // input is 
        // { type, segments 1 to  4}
        // For more information, visit https://dv.auth2factor.com
        const resp = await dv.calculate(CedulaInputTypes.N,
            [0, 8],
            [0, 0],
            [7, 1, 3],
            [2, 2, 3]);

        expect(resp).equals('11');
```

@molekilla, Rogelio Morrell C. , IFESA
Copyright 2020 - 2021

##### MIT License
