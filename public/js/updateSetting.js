import axios from 'axios';
import { showAlert } from './alerts';

export const updateSetting = async (data, type) => {
    try {
        const url =
            type === 'password'
                ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
                : 'http://127.0.0.1:3000/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if (res.data.status === 'succes') {
            showAlert('success', `${type.toUpperCase()} update successfully`);
        }
    } catch (err) {
        console.log(url);
        showAlert('error', err.response.data.message)
    }
}