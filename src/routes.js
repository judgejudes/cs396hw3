"use strict";

const resetDB = require("../config/scripts/populateDB")

const Companion = require("./schema/Companion");
const Doctor = require("./schema/Doctor");

const express = require("express");
const router = express.Router();


// completely resets your database.
// really bad idea irl, but useful for testing
router.route("/reset")
    .get((_req, res) => {
        resetDB(() => {
            res.status(200).send({
                message: "Data has been reset."
            });
        });
    });

router.route("/")
    .get((_req, res) => {
        console.log("GET /");
        res.status(200).send({
            data: "App is running."
        });
    });

// ---------------------------------------------------
// Edit below this line
// ---------------------------------------------------
router.route("/doctors")
    .get((req, res) => {
        console.log("GET /doctors");

        // already implemented:
        Doctor.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })

    // #2.1
    .post((req, res) => {
        console.log("POST /doctors");
        console.log('req.body', req.body);
        if (!req.body.name || !req.body.seasons) {
            res.status(500).send({ message: 'name and seasons required' })
            return;
        }
        Doctor.create(req.body)
            .save()
            .then(doctor => {
                res.status(201).send(doctor);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

// optional:
router.route("/doctors/favorites")
    .get((req, res) => {
        console.log(`GET /doctors/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /doctors/favorites`);
        res.status(501).send();
    });

router.route("/doctors/:id")
    // #2
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}`);
        Doctor.findById(req.params.id)
            .then(doctor => {
                if (doctor) {
                    res.status(200).send(doctor);
                }
                else {
                    res.status(404).send({
                        message: 'Doctor with that id does not exist'
                    });
                }
            })
            .catch(err => {
                res.status(404).send({
                    message: "Please enter valid ID",
                    error: err
                })
            })
    })
    // 2.3
    .patch((req, res) => {
        console.log(`PATCH /doctors/${req.params.id}`);
        // res.status(501).send();
        console.log("req.body", req.body)
        Doctor.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(doctor => {
                console.log("doctor", doctor)
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Please enter a valid ID',
                    error: err
                })
            })


    })
    // 2.5
    .delete((req, res) => {
        console.log(`DELETE /doctors/${req.params.id}`);
        // res.status(501).send();
        Doctor.findOneAndDelete(
            { _id: req.params.id }
        )
            .then(data => {
                if (data) {
                    res.status(200).send(null)
                }
                else {
                    res.status(400).send({
                        message: 'Please enter a valid ID'
                    })
                }
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Artist with id "${req.params.id}" does not exist',
                    error: err
                })
            })
    });

router.route("/doctors/:id/companions")
    // #3
    // list of companions that travelled with the doctor
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/companions`);
        // res.status(501).send();
        // use the ID to
        console.log(req.params.id)
        Companion.find({ 'doctors': { '$eq': req.params.id } })
            .then(companions => {
                if (!companions) {
                    res.status(404).send({ message: "please enter a valid ID" })
                }
                else {
                    res.status(200).send(companions);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            })
    });


router.route("/doctors/:id/goodparent")
    // #4
    // true: if every companion is alive; otherwise, false
    .get((req, res) => {
        console.log(`GET /doctors/${req.params.id}/goodparent`);
        // res.status(501).send();
        Companion.find({ 'doctors': { '$eq': req.params.id }, 'alive': false })
            .then(companions => {
                // if there are no companions that have both
                if (companions.length == 0) {
                    // res.status(404).send({message: "please enter a valid ID"})
                    res.status(200).send("true")
                    return;
                }
                else {
                    res.status(200).send("false")
                }

            })
            .catch(err => {
                res.status(404).send(err);
            })

    });

// optional:
router.route("/doctors/favorites/:doctor_id")
    .delete((req, res) => {
        console.log(`DELETE /doctors/favorites/${req.params.doctor_id}`);
        res.status(501).send();
    });

router.route("/companions")
    .get((req, res) => {
        console.log("GET /companions");
        // already implemented:
        Companion.find({})
            .then(data => {
                res.status(200).send(data);
            })
            .catch(err => {
                res.status(500).send(err);
            });
    })

    // 2.2
    .post((req, res) => {
        console.log("POST /companions");
        // res.status(501).send();
        if (!req.body.name || !req.body.character || !req.body.doctors || !req.body.seasons || !req.body.alive) {
            res.status(500).send({ message: 'name, character, doctors, seasons, alive status required' })
            return;
        }
        Companion.create(req.body)
            .save()
            .then(doctor => {
                res.status(201).send(doctor);
            })
            .catch(err => {
                res.status(500).send(err);
            })
    });

router.route("/companions/crossover")
    .get((req, res) => {
        console.log(`GET /companions/crossover`);
        // res.status(501).send();
        // list of the companions who travelled with multiple doctors
        Companion.find({ $nor: [{ doctors: { $size: 0 } }, { doctors: { $size: 1 } }] })
            .then(doctor => {
                if (!doctor) {
                    res.status(404).send({ message: "Please enter valid ID" });
                }
                else {
                    res.status(200).send(doctor);
                }
            })
            .catch(err => {
                res.status(404).send(err);
            });
    });

// optional:
router.route("/companions/favorites")
    .get((req, res) => {
        console.log(`GET /companions/favorites`);
        res.status(501).send();
    })
    .post((req, res) => {
        console.log(`POST /companions/favorites`);
        res.status(501).send();
    })

router.route("/companions/:id")
    // #6

    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}`);
        Companion.findById(req.params.id)
            .then(doctor => {
                if (doctor) {
                    res.status(200).send(doctor);
                }
                else {
                    res.status(404).send({
                        message: 'Doctor with that id does not exist'
                    });
                }
            })
            .catch(err => {
                res.status(404).send({
                    message: "Please enter valid ID",
                    error: err
                })
            })
    })
    .patch((req, res) => {
        console.log(`PATCH /companions/${req.params.id}`);
        Companion.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        )
            .then(doctor => {
                console.log("doctor", doctor)
                res.status(200).send(doctor);
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Please enter a valid ID',
                    error: err
                })
            })
    })

    // 2.6
    .delete((req, res) => {
        console.log(`DELETE /companions/${req.params.id}`);
        // res.status(501).send();
        Companion.findOneAndDelete(
            { _id: req.params.id }
        )
            .then(data => {
                if (data) {
                    res.status(200).send(null)
                }
                else {
                    res.status(400).send({
                        message: 'Please enter a valid ID'
                    })
                }
            })
            .catch(err => {
                res.status(404).send({
                    message: 'Please enter a valid ID',
                    error: err
                })
            })
    });

router.route("/companions/:id/doctors")
    // #7: a list of doctors with whom this companion travelled
    //         Companion.find({ 'doctors': { '$eq': req.params.id }, 'alive': false})
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/doctors`);

        // return companion that matches this id
        Companion.find({ '_id': { '$eq': req.params.id } })
            // then find the doctors' ids listed in "doctors" field
            .then(comp => {
                // console.log("comp", comp);
                console.log("comp id", comp[0].doctors)
                // Doctor.find({'_id': { '$eq': comp.id }})
                let doctorsId = comp[0].doctors;
                // then search in Doctor for any matches with those ids
                Doctor.find({ '_id': { '$in': doctorsId } })
                    .then(doctors => {
                        console.log("doctors", doctors)
                        res.status(200).send(doctors);
                    })
            })
            .catch(err => {
                res.status(404).send({
                    message: "Please enter valid ID",
                    error: err
                })
            })

    });

router.route("/companions/:id/friends")
    // #8: A list of the companions who appeared on at least one of the same seasons as this companion.
    .get((req, res) => {
        console.log(`GET /companions/${req.params.id}/friends`);

         // list of the companions who appeared on at least one
        // of the same seasons as this companion
// testing
        Companion.findById(req.params.id)
            .then(companion => {
                if (!companion){
                    res.status(404).send({message: "Please enter a valid ID"});
                }
                else{
                    Companion.find({ $and: [{_id: {$ne: req.params.id} },
                                            {seasons: {$in: companion.seasons}}]
                                    })
                             .then(friends => {
                                res.status(200).send(friends);

                            })
                        }
                })
            .catch(err => {
                res.status(404).send({
                    message: "Please enter valid ID",
                    error: err
                })
            })
    });
        // find companion with that id
        // Companion.find({ '_id': { '$eq': req.params.id } })
    //         Companion.findById(req.params.id)
    //         .then(comp => {
    //             console.log("seasons", comp.seasons)
    //             // res.status(200).send();

    //             let seasons = comp.seasons;

    //             // then search in Companions for any matches with those seasons
    //             // QUESTION: how to get companions without that req.params.id?
    //             // Companion.find({ $nor: [{ doctors: { $size: 0 } }, { doctors: { $size: 1 } }] })
    //             //      Companion.find({ 'doctors': { '$eq': req.params.id } })
    //             // Companion.find({ 'seasons': { '$in': seasons }})
    //             // {'$nor': [{ '_id': {'$eq': req.params.id}}]}
    //                 // , { '_id': { '$ne': req.params.id } }
    //                 Companion.find({ $and: [{_id: {$ne: req.params.id} },
    //                                                                 {seasons: {$in: companion.seasons}}]})
    //                 .then(friends => {
    //                     console.log("friends", friends)
    //                     res.status(200).send(friends);
    //                 })

    //             // hmm..have to remove the companion with that id specifically...
    //         })
    //         .catch(err => {
    //             res.status(404).send({
    //                 message: "Please enter valid ID",
    //                 error: err
    //             })
    //         })
    // });

// optional:
router.route("/companions/favorites/:companion_id")
    .delete((req, res) => {
        console.log(`DELETE /companions/favorites/${req.params.companion_id}`);
        res.status(501).send();
    });

module.exports = router;