var FarmOSAPI = require("./FarmOSAPI.js")

var getAllPages = FarmOSAPI.getAllPages
var getSessionToken = FarmOSAPI.getSessionToken
var updateRecord = FarmOSAPI.updateRecord
var createRecord = FarmOSAPI.createRecord
var deleteRecord = FarmOSAPI.deleteRecord
var getRecord = FarmOSAPI.getRecord

var getIDToUserMap = FarmOSAPI.getIDToUserMap
var getIDToCropMap = FarmOSAPI.getIDToCropMap
var getIDToAreaMap = FarmOSAPI.getIDToAreaMap
var getIDToUnitMap = FarmOSAPI.getIDToUnitMap
var getIDToLogTypeMap = FarmOSAPI.getIDToLogTypeMap

var getUserToIDMap = FarmOSAPI.getUserToIDMap
var getCropToIDMap = FarmOSAPI.getCropToIDMap
var getAreaToIDMap = FarmOSAPI.getAreaToIDMap
var getUnitToIDMap = FarmOSAPI.getUnitToIDMap
var getLogTypeToIDMap = FarmOSAPI.getLogTypeToIDMap

var quantityLocation = FarmOSAPI.quantityLocation

describe('API Request Functions', () => {
    beforeEach(() => {
        // Login as restws1, which is a user that can make api requests.
        cy.login('restws1', 'farmdata2')
    })

    context('getAllPages API request function', () => {
        it('Test on a request with a one page response.', () => {

            let requests=0
            let testArray = []

            cy.intercept('GET',/log\?type=farm_seeding/, (req) => {
                requests++  // count requests made on this route.
            })
            .then(() => {
                // wrap and alias the getAllPages here.  
                // It returns a promise that resolves when all pages have been 
                // fetched into the array.
                cy.wrap(getAllPages('/log?type=farm_seeding&id[le]=50', testArray))
                .as('done') 
            })

            // Wait here for all pages to be fetched.
            cy.get('@done')
            .then(() => {
                expect(requests).to.equal(1)
                expect(testArray).to.have.length(50)
            })
        })

        it('Test on a request with multiple pages', () => {
            let firstCalls=0
            let secondCalls=0
            let lastCalls=0
            let testArray = []

            cy.intercept("GET","/log?type=farm_seeding&page=5", (req) => {
                firstCalls++
            })
            cy.intercept("GET","/log?type=farm_seeding&page=6", (req) => {
                secondCalls++
            })
            cy.intercept("GET","/log?type=farm_seeding&page=9", (req) => {
                lastCalls++
            })
            .then(() => {
                cy.wrap(getAllPages("/log?type=farm_seeding&page=5", testArray))
                .as('done')
            })
        
            cy.get('done').should(() => {
                expect(firstCalls).to.equal(1)
                expect(secondCalls).to.equal(1)
                expect(lastCalls).to.equal(1)
                expect(testArray).to.have.length.gt(400)
            })
        })
    })
    
    context('test maping functions', () => {
        it('User map functions get the proper name/id for the users', () => {
            let manager1ID = -1
            let adminID = -1
            let worker2ID = -1
            let guestID = -1
            let restws1ID = -1

            cy.wrap(getUserToIDMap()).as('nameMap')
            cy.get('@nameMap').should(function(nameToIdMap) {
                expect(nameToIdMap).to.not.be.null
                expect(nameToIdMap).to.be.a('Map')
                expect(nameToIdMap.size).to.equal(11)

                manager1ID = nameToIdMap.get('manager1')
                adminID = nameToIdMap.get('admin')
                worker2ID = nameToIdMap.get('worker2')
                guestID = nameToIdMap.get('guest')
                restws1ID = nameToIdMap.get('restws1')
            })
            .then(() => {
                cy.wrap(getIDToUserMap()).as('idMap')
                cy.get('@idMap').should(function(idToNameMap) {
                    expect(idToNameMap).to.not.be.null
                    expect(idToNameMap).to.be.a('Map')
                    expect(idToNameMap.size).to.equal(11)

                    expect(idToNameMap.get(manager1ID)).to.equal('manager1')
                    expect(idToNameMap.get(adminID)).to.equal('admin')
                    expect(idToNameMap.get(worker2ID)).to.equal('worker2')
                    expect(idToNameMap.get(guestID)).to.equal('guest')
                    expect(idToNameMap.get(restws1ID)).to.equal('restws1')
                })
            })
        })

        it('Crop map functions get the proper name/id for the crops', () => {
            //first and last of the first page of the response
            let arugulaID = -1
            let strawberryID = -1
            //first and last of the second page of the response
            let sunflowerSeedsID = -1
            let zuchiniID = -1
            // test some compound names too
            let onionSpringID = -1
            let cornSweetID = -1

            cy.wrap(getCropToIDMap()).as('cropMap')
            cy.get('@cropMap').should((cropToIdMap) => {
                expect(cropToIdMap).to.not.be.null
                expect(cropToIdMap).to.be.a('Map')
                expect(cropToIdMap.size).to.equal(111)

                arugulaID = cropToIdMap.get('ARUGULA')
                strawberryID = cropToIdMap.get('STRAWBERRY')
                sunflowerSeedsID = cropToIdMap.get('SUNFLOWER SEEDS')
                zuchiniID = cropToIdMap.get('ZUCCHINI')
                onionSpringID = cropToIdMap.get('ONION-SPRING')
                cornSweetID = cropToIdMap.get('CORN-SWEET')
            })
            .then(() => {
                cy.wrap(getIDToCropMap()).as('idMap')
                cy.get('@idMap').should((idToCropMap) => {
                    expect(idToCropMap).to.not.be.null
                    expect(idToCropMap).to.be.a('Map')
                    expect(idToCropMap.size).to.equal(111)

                    expect(idToCropMap.get(arugulaID)).to.equal('ARUGULA')
                    expect(idToCropMap.get(strawberryID)).to.equal('STRAWBERRY')
                    expect(idToCropMap.get(sunflowerSeedsID)).to.equal('SUNFLOWER SEEDS')
                    expect(idToCropMap.get(zuchiniID)).to.equal('ZUCCHINI')
                    expect(idToCropMap.get(onionSpringID)).to.equal('ONION-SPRING')
                    expect(idToCropMap.get(cornSweetID)).to.equal('CORN-SWEET')
                })
            })
        })

        it('Area map functions get the proper name/id for the areas', () => {
            let aID = -1
            let zID = -1
            let chuauID = -1
            let chuau1ID = -1
            let chuau5ID = -1

            cy.wrap(getAreaToIDMap()).as('areaMap')
            cy.get('@areaMap').should(function(areaToIDMap){
                expect(areaToIDMap).to.not.be.null
                expect(areaToIDMap).to.be.a('Map')
                expect(areaToIDMap.size).to.equal(70)

                aID = areaToIDMap.get('A')  
                zID = areaToIDMap.get('Z')
                chuauID = areaToIDMap.get('CHUAU')  
                chuau1ID = areaToIDMap.get('CHUAU-1') 
                chuau5ID = areaToIDMap.get('CHUAU-5')           
            })
            .then(() => {
                cy.wrap(getIDToAreaMap()).as('idMap')
                cy.get('@idMap').should(function(idToAreaMap){
                    expect(idToAreaMap).to.not.be.null
                    expect(idToAreaMap).to.be.a('Map')
                    expect(idToAreaMap.size).to.equal(70)

                    expect(idToAreaMap.get(aID)).to.equal('A')
                    expect(idToAreaMap.get(zID)).to.equal('Z')
                    expect(idToAreaMap.get(chuauID)).to.equal('CHUAU')
                    expect(idToAreaMap.get(chuau1ID)).to.equal('CHUAU-1')
                    expect(idToAreaMap.get(chuau5ID)).to.equal('CHUAU-5')
                })
            })
        })

        it('Unit map functions get the proper name/id for the units',() => {
            let seedsID = -1
            let rowFeetID = -1
            let flatsID = -1
            let hoursID = -1
            let peopleID = -1

            cy.wrap(getUnitToIDMap()).as('unitMap')
            cy.get('@unitMap').should(function(unitToIDMap){
                expect(unitToIDMap).to.not.be.null
                expect(unitToIDMap).to.be.a('Map')
                expect(unitToIDMap.size).to.equal(33)

                seedsID = unitToIDMap.get('SEEDS')
                rowFeetID = unitToIDMap.get('ROW FEET')
                flatsID = unitToIDMap.get('FLATS')
                hoursID = unitToIDMap.get('HOURS')
                peopleID = unitToIDMap.get('PEOPLE')
            })
            .then(() => {
                cy.wrap(getIDToUnitMap()).as('idMap')
                cy.get('@idMap').should(function(idToUnitMap){
                    expect(idToUnitMap).to.not.be.null
                    expect(idToUnitMap).to.be.a('Map')
                    expect(idToUnitMap.size).to.equal(33)

                    expect(idToUnitMap.get(seedsID)).to.equal('SEEDS')
                    expect(idToUnitMap.get(rowFeetID)).to.equal('ROW FEET')
                    expect(idToUnitMap.get(flatsID)).to.equal('FLATS')
                    expect(idToUnitMap.get(hoursID)).to.equal('HOURS')
                    expect(idToUnitMap.get(peopleID)).to.equal('PEOPLE')
                })
            })
        })

        it('Log Type map functions get the proper name/id for the log types', () => {
            let directSeedingsID = -1
            let traySeedingsID = -1
            let waterID = -1
            let transplantingsID = -1
            let animalsID = -1

            cy.wrap(getLogTypeToIDMap()).as('logMap')
            cy.get('@logMap').should(function(logTypeToIDMap){
                expect(logTypeToIDMap).to.not.be.null
                expect(logTypeToIDMap).to.be.a('Map')
                expect(logTypeToIDMap.size).to.equal(9)

                directSeedingsID = logTypeToIDMap.get('Direct Seedings')
                traySeedingsID = logTypeToIDMap.get('Tray Seedings')
                waterID = logTypeToIDMap.get('Water')
                transplantingsID = logTypeToIDMap.get('Transplantings')
                animalsID = logTypeToIDMap.get('Animals')
            })
            .then(() => {
                cy.wrap(getIDToLogTypeMap()).as('idMap')
                cy.get('@idMap').should(function(idToLogTypeMap){
                    expect(idToLogTypeMap).to.not.be.null
                    expect(idToLogTypeMap).to.be.a('Map')
                    expect(idToLogTypeMap.size).to.equal(9)

                    expect(idToLogTypeMap.get(directSeedingsID)).to.equal('Direct Seedings')
                    expect(idToLogTypeMap.get(traySeedingsID)).to.equal('Tray Seedings')
                    expect(idToLogTypeMap.get(waterID)).to.equal('Water')
                    expect(idToLogTypeMap.get(transplantingsID)).to.equal('Transplantings')
                    expect(idToLogTypeMap.get(animalsID)).to.equal('Animals')
                })
            })
        })
    })

    context('getSessionToken API request function', () => {
        it('returns a token when it resolves', () => {
            getSessionToken().then(token => {
                expect(token).to.not.be.null
                expect(token.length).to.equal(43)
            })
        })
    })

    context('getRecord API request function', () => {
        it('gets an existing log', () => {

            cy.wrap(getRecord('/log/3377')).as('done')

            cy.get('@done').should(function(response) {
                expect(response.status).to.equal(200)
                expect(response.data.id).to.equal('3377')
            })
        })

        it('gets an existing asset', () => {
            cy.wrap(getRecord('/farm_asset/1')).as('done')

            cy.get('@done').should(function(response) {
                expect(response.status).to.equal(200)
                expect(response.data.id).to.equal('1')
            })
        })

        it('attempt to get a non-existent record',() => {
            cy.wrap(getRecord('/log/9999999')).as('done')

            cy.get('@done').should(function(response) {
                expect(response.status).to.equal(404)
            })
        })
    })

    context('deleteRecord API request function', () => {
        it('deletes a log', () => {
            let logID = -1
            let token = null

            // Creates a new log entry & ensures it was successful.
            // Deletes the log entry using the deleteRecord function.
            // Requests the log to ensure that it has been deleted.

            cy.wrap(getSessionToken())
            .then(sessionToken => {
                token = sessionToken
     
                req = {
                    url: '/log',
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN' : token,
                    },
                    body: {
                        "name": "Delete Test",
                        "type": "farm_observation",
                        "timestamp": "123",
                    }
                }

                cy.request(req).as('create')
            })

            cy.get('@create').should(function(response) {
                expect(response.status).to.equal(201)
                logID = response.body.id
            })
            .then(() => {
                cy.wrap(deleteRecord('/log/' + logID, token)).as('delete')
            })

            cy.get('@delete').should((response) => {
                expect(response.status).to.equal(200)
            })
            .then(() => {
                cy.wrap(getRecord('/log/' + logID)).as('check')
            })

            cy.get('@check').should(function(response) {
                expect(response.status).to.equal(404) // 404 - not found
            })
        })
    })

    context('create API request function', () => {
        it('creates a new log', () => {

            let logID = -1
            let token = null

            // Creates a new log using the createRecord function
            // Checks that it exists
            // Deletes it using the deleteRecord function (tested above)

            cy.wrap(getSessionToken())
            .then((sessionToken) => {
                token = sessionToken

                newLog = {
                    "name": "Create Test",
                    "type": "farm_observation",
                    "timestamp": "123",
                }

                cy.wrap(createRecord('/log', newLog, token)).as('create')
            })
              
            cy.get('@create').should((response) => {
                logID = response.data.id
                expect(response.status).to.equal(201)
            })
            .then(() => {
                cy.wrap(getRecord('/log/' + logID)).as('exists')
            })

            cy.get('@exists').should((response) => {
                expect(response.status).to.equal(200)
                expect(response.data.name).to.equal('Create Test')
            })
            .then(() => {
                cy.wrap(deleteRecord('/log/' + logID, token)).as('delete')
            })
           .then(() => {
                cy.wrap(getRecord('/log/' + logID)).as('gone')
            })

            cy.get('@gone').should(function(response) {
                expect(response.status).to.equal(404) // 404 - not found
            })
        })
    })    

    context('update function testing', () => {
        it('change the name of an observation log', () => {
            let logID = -1
            let token = null

            // Creates a new log using the createRecord function (tested above)
            // Updates the log using the updateRecord function.
            // Requests the log to ensure that it was updated
            // Deteles the log using the deleteRecord function (tested above)

            cy.wrap(getSessionToken())
            .then((sessionToken) => {
                token = sessionToken

                newLog = {
                    "name": "Update Test",
                    "type": "farm_observation",
                    "timestamp": "123",
                }

                cy.wrap(createRecord('/log', newLog, token)).as('create')
            })

            cy.get('@create').should((response) => {
                logID = response.data.id
                expect(response.status).to.equal(201)
            })
            .then(() => {
                update = {
                    "name": "Update Test Updated"
                }

                cy.wrap(updateRecord('/log/' + logID, update, token)).as('update')
            })

            cy.get('@update').should((response) => {
                expect(response.status).to.equal(200)
            })
            .then(() => {
                cy.wrap(getRecord('/log/' + logID)).as('check')
            })

            cy.get('@check').should((response) => {
                expect(response.status).to.equal(200)
                expect(response.data.name).to.equal('Update Test Updated')
            })
            .then(() => {
                cy.wrap(deleteRecord('/log/' + logID, token)).as('delete')
            })

            cy.get('@delete').should(function(response) {
                expect(response.status).to.equal(200)
            })
        })
    })

    context('test quantity location function', () => {
            let quantity = [{
                "measure": "length", 
                "value": 5,
                "unit": {
                    "id": "1987", 
                    "resource": "taxonomy_term"
                },
                "label": "Amount planted"
            },
            {
                "measure": "ratio", 
                "value": 19,
                "unit": {
                    "id": "98",
                    "resource": "taxonomy_term"
                },
                "label": "Rows/Bed"
            },
            {
                "measure": "time", 
                "value": 178,
                "unit": {
                    "id": "80",
                    "resource": "taxonomy_term"
                },
                "label": "Labor"
            },
            {
                "measure": "count", 
                "value": 1,
                "unit": {
                    "id": "90",
                    "resource": "taxonomy_term"
                },
                "label": "Workers"
            }]

            it('test if returns 2 for Labor', () => {
                expect(quantityLocation(quantity, 'Labor')).to.equal(2)
            })
            it('test if returns 0 for "Amount planted"', () =>{
                expect(quantityLocation(quantity, 'Amount planted')).to.equal(0)
            })
            it('returns -1 when no label equal the label input', () => {
                expect(quantityLocation(quantity, 'Yeehaw')).to.equal(-1)
            })
        })
    })