"use strict";

const axios = require("axios");
const https = require("https");

module.exports.hello = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message:
                    "Go Serverless v1.0! Your function executed successfully!",
                input: event
            },
            null,
            2
        )
    };

    // Use this code if you don't use the http event with the LAMBDA-PROXY integration
    // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.verifiedDni = async event => {
    const payload = JSON.parse(event.body);
    const token = process.env.API_TOKEN;
    const endPointApi = "https://dniruc.apisperu.com/api/v1/dni";
    const filterKeys = ["dni", "verificationCode"];

    let normalizeResponse = null;
    let success = true;

    const instance = axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });

    try {
        const { data } = await instance.get(
            `${endPointApi}/${payload.dni}?token=${token}`
        );

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
