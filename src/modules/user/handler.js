'use strict';

import axios from 'axios';
import https from 'https';
import Joi from '@hapi/joi';

import { saveItem, getItem } from '../../database';

const verifiedDniSchema = Joi.object({
  dni: Joi.string()
    .required()
    .regex(/^[0-9]{8}$/)
    .error(new Error('Wrong DNI')),
  verificationCode: Joi.string()
    .required()
    .regex(/^[0-9]{1}$/)
    .error(new Error('Wrong verification code')),
});

export const verifiedDni = async (event) => {
  const payload = JSON.parse(event.body);
  const validation = verifiedDniSchema.validate(payload);

  if (validation.error) {

    return buildResponse(400, {
      error: {
        code: 'ValidationError',
        message: validation.error.message,
      },
    });

  }

  const token = process.env.API_DNI_TOKEN;
  const endPointApi = process.env.API_DNI_URL;
  const filterKeys = ['dni', 'verificationCode'];

  let normalizeResponse = null;
  let success = true;

  const instance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  try {
    const { data } = await instance.get(`${endPointApi}/${payload.dni}?token=${token}`);

    console.log(data);

    const savedItem = await saveItem({
      tableName: process.env.USER_TABLE,
      item: { userId: payload.dni /* , createAt: new Date().toISOString() */ },
    });

    console.log('Saved Item', savedItem);

    const item = await getItem({
      tableName: process.env.USER_TABLE,
      keys: {
        userId: payload.dni,
      },
    });

    console.log('Get item', item);

    normalizeResponse = {
      dni: data.dni,
      verificationCode: data.codVerifica,
      names: data.nombres,
    };
  } catch (error) {
    console.log(error);

    return buildResponse(400, {
      error: {
        code: 'WrongDataError',
        message: 'Input valid dni or verification code',
      },
    });
  }

  filterKeys.forEach((key) => {
    if (parseInt(payload[key]) !== parseInt(normalizeResponse[key])) {
      success = false;
    }
  });

  if (!success) {


    return buildResponse(400, {
      error: {
        code: 'WrongDataError',
        message: 'Input valid dni or verification code',
      },
    });

  }

  return buildResponse(200, { data: normalizeResponse });
};


function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}
