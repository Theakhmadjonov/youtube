import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import axios from 'axios';
import ENDPOINTS from 'src/common/constants/endpoints';

@Injectable()
export class SMSService {
  private email: string = process.env.ESKIZ_EMAIL as string;
  private password: string = process.env.ESKIZ_PASSWORD as string;
  constructor() {}

  async getToken() {
    try {
      const url = ENDPOINTS.getEskizTokenUrl();
      const formData = new FormData();
      formData.set('email', this.email);
      formData.set('password', this.password);
      const {
        data: {
          data: { token },
        },
      } = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return token;
    } catch (error) {
      throw new InternalServerErrorException('Server error');
    }
  }

  async sendSms(phone: string, code: string) {
    const url = ENDPOINTS.sendSmsUrl();
    const token = await this.getToken();
    const formData = new FormData();
    formData.set('mobile_phone', phone);
    formData.set('message', `StudyHub ilovasiga kirish kodi:${code}`);
    formData.set('from', '4546');
    const { status } = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    if (status !== 200) throw new InternalServerErrorException('Server error');
    return true;
  }
}
