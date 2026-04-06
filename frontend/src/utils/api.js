import axiosInstance from './axiosInstance';

// All functions use the shared axiosInstance which:
//  - Attaches Bearer token on every request
//  - Auto-refreshes on 401 and retries once

export const getData = async (url) => {
  try {
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};

export const postData = async (url, formData) => {
  try {
    const response = await axiosInstance.post(url, formData);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};

export const putData = async (url, updatedData) => {
  try {
    const response = await axiosInstance.put(url, updatedData);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};

export const putDataForImage = async (url, updatedData) => {
  try {
    const response = await axiosInstance.put(url, updatedData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};

export const deleteData = async (url, body = null) => {
  try {
    const response = await axiosInstance.delete(url, { data: body });
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.response?.data?.message || 'Something went wrong',
    };
  }
};
