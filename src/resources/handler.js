"use strict";

const axios = require("axios");
const https = require("https");

module.exports.verifiedDni = async event => {

    const payload = JSON.parse(event.body);
    const token = process.env.API_DNI_TOKEN;
    const endPointApi = process.env.API_DNI_URL;
    ;
    const filterKeys = ["dni", "verificationCode"];

    let normalizeResponse = null;
    let success = true;

    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    console.log(token);
    try {
        const { data } = await instance.get(
            `${endPointApi}/${payload.dni}?token=${token}`
        );

        console.log(data)

        normalizeResponse = {
            dni: data.dni,
            verificationCode: data.codVerifica,
            names: data.nombres
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: {
                    code: "WrongDataError",
                    message: "Input valid dni or verification code"
                }
            })
        };
    }

    filterKeys.forEach(key => {
        if (parseInt(payload[key]) !== parseInt(normalizeResponse[key])) {
            success = false;
        }
    });

    if (!success) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: {
                    code: "WrongDataError",
                    message: "Input valid dni or verification code"
                }
            })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ data: normalizeResponse })
    };
};