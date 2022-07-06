const {  } = require('../routes/validation');
const { validationResult } = require('express-validator');
const moment = require('moment');
const jwt = require('jsonwebtoken');

// POST /recipies/:recipeId/update -- update a recipe
exports.update = (req, res) =>{
    const { recipeTitle, description, servings, prepTime, totalTime,id } = req.body
    let recipesSql = 
    `UPDATE recipes 
    SET
        name = "${recipeTitle || null}",
        description = "${description || null}",
        servings = ${servings || null},
        prepTime = ${prepTime || null},
        totalTime = ${totalTime || null}
    WHERE
        id = ${id}`;
    
    
    let recipeIngCatsSql = 
      `INSERT INTO recipeIngCats(
          name,
          sortOrder) 
        VALUES(?)`;


    let ingNameSql = 
      `INSERT INTO ingNames(
          userId,
          dateModified,
          dateCreated,
          name) 
        VALUES(?)`;

        
        let ingListSql = 
        `INSERT INTO ingList(
            nameId,
            unitTypeId,
            userId,
            categoryId,
            sort,
            amount,
            recipeId) 
          VALUES(?)`;
// + ---------------############################################-----------------------------------------+
// |  note to future self - try to do updates as an array of arrays but NEW inserts one at a time        |
// + ---------------############################################-----------------------------------------+
        update_recipeValues = []
        update_catValues = []
        update_ingNameValues = []
        update_ingListValues = []

        // recipes table - UPDATE existing record
 
        update_recipesValues = [
            recipeTitle || null,
            description || null,
            servings || null,
            prepTime || null,
            totalTime || null
        ]

        db.query(recipesSql, update_recipeValues, function(err, recipesData, fields) {
            console.log(`Recipe updated ${update_recipesValues} added`)
            if(err) throw err;
        })


        for (const c in req.body.ingForm2) {
            let cat = req.body.ingForm2[c]
            // recipeIngCats table - new records
            // console.log(cat)
            if(!cat.catId){
                let new_cat = [
                    cat.cat,
                    cat.sort
                ]
                console.log('new_cat: ',new_cat)
                let new_catId = 0 // just setting empty var as 0
                db.query(recipeIngCatsSql, [new_cat], function(err, catNameData, fields) {
                    console.log(`New category added ${new_cat} added`)
                    if(err) {
                        console.log(err.stack)
                        throw err
                    }
                    new_catId = catNameData.insertId
                    console.log('category: ', cat.cat)
                    console.log('fields: ', fields)
                    console.log('new_catId: ',new_catId)
                })
            }
            
            for (i in cat.ingredients) {
                let ingredient = cat.ingredients[i]
                if(!ingredient.ingId) {
                    new_ing = [
                        1,
                        moment().utc().format('YYYY-MM-DD hh:mm:ss'),
                        moment().utc().format('YYYY-MM-DD hh:mm:ss'),
                        ingredient.fieldValue || null
                    ]
                    
                    let new_ingId = 0
                    // ingName table - new records
                    db.query(ingNameSql, [new_ing], function(err, ingNameData, fields) {
                        console.log(`New ingredient ${new_ing} added`)
                        if(err) {
                            console.log(err.stack)
                            throw err
                        }
                        console.log('result.insertId')
                        new_ingId = ingNameData.insertId
                        console.log('new_ingId: ', new_ingId)
                    })
                    // ingList table - new records
                        
                    new_ingListValues = [
                        new_ingId,
                        ingredient.unitTypeId || null,
                        1, // userId (eventually to come from token)
                        new_catId,
                        ingredient.sortOrder || null,
                        ingredient.unitTypeAmount || null,
                        id // req.body.id
                    ]
                    db.query(ingListSql, [new_ingListValues], function(err, recipesData, fields) {
                        console.log(`ingListValues ${update_recipesValues} added`)
                        if(err) throw err;
                    })
                } else {
                    update_ingNameValues.push(
                        [1,
                        moment().utc().format('YYYY-MM-DD hh:mm:ss'),
                        moment().utc().format('YYYY-MM-DD hh:mm:ss'),
                        ingredient.fieldValue]
                    )
                }

            }

            // console.log(cat)
        } 
        console.log('new_ingNameValues')
        console.log(new_ingNameValues)
        console.log('update_ingNameValues')
        console.log(update_ingNameValues)

    //     let name = req.body.name === null ? req.body.name : pluralize(req.body.namePlural,1);
    //     let namePlural = req.body.name === null ? req.body.namePlural : pluralize(req.body.name,2);
    //     let userId = req.body.userId || 1; //admin
    //     let dateModified = moment().utc().format('YYYY-MM-DD hh:mm:ss');
    //     let dateCreated = moment().utc().format('YYYY-MM-DD hh:mm:ss');
    //     let descriptionId = req.body.descriptionId || null;
    //     let photoId = req.body.photoId || null;
    //     let values = [
    //         name,
    //         namePlural,
    //         userId,
    //         dateModified,
    //         dateCreated,
    //         descriptionId,
    //         photoId,
    //     ];

    // if(0) {
    //   db.query(ingNameSql, [new_ingNameValues], function(err, data, fields) {
    //       if(err) throw err;
    //       res.json({
    //           status: 200,
    //           message: `New ingredient added successfully`
    //       })
    //   })
    // } else {
    //     res.json({
    //         status: 403,
    //         message: "One or more required fields is missing."
    //     })
    //     console.log(req.body)
    // }

    // res.json({
    //     status: 403,
    //     message: "One or more required fields is missing."
    // })
}