'use strict';

import axios from 'axios';
import https from 'https';
import ubigeos from 'ubigeos';
import regions from 'ubigeos/lib/data/regions';

import { saveItem, getItem } from '../../database';

export const verifiedDni = async (event) => {
  const payload = JSON.parse(event.body);
  const validation = verifiedDniSchema.validate(payload);

  if (validation.error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          code: 'ValidationError',
          message: validation.error.message,
        },
      }),
    };
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
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          code: 'WrongDataError',
          message: 'Input valid dni or verification code',
        },
      }),
    };
  }

  filterKeys.forEach((key) => {
    if (parseInt(payload[key]) !== parseInt(normalizeResponse[key])) {
      success = false;
    }
  });

  if (!success) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          code: 'WrongDataError',
          message: 'Input valid dni or verification code',
        },
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ data: normalizeResponse }),
  };
};

export const getDepartments = async (event) => {
  const keys = Object.keys(regions);
  let departments = [];

  departments = keys
    .map((key) => ({
      code: key,
      name: regions[key],
    }))
    .sort((a, b) => parseInt(a.code) - parseInt(b.code));

  return {
    statusCode: 200,
    body: JSON.stringify({ data: departments }),
  };
};

export const getProvinces = async (event) => {
  const { departmentCode } = event.pathParameters;
  const region = new ubigeos.Region(departmentCode);

  return {
    statusCode: 200,
    body: JSON.stringify({ data: region.getProvincies() }),
  };
};

export const getDistricts = async (event) => {
  const { provinceCode } = event.pathParameters;
  const region = new ubigeos.Province(provinceCode);

  return {
    statusCode: 200,
    body: JSON.stringify({ data: region.getDistricts() }),
  };
};
