// todo: 포인트 정보 
import BasicController from '@/common/BasicController';
import { Logger } from '@/common/helper/Logger';
import { NextFunction, Request, Response } from 'express';

class PointController extends BasicController {
  public index = (req: Request, res: Response, next: NextFunction) => {
    Logger.debug('PointController:index');
    try {
      res.status(200).json({ 
        tranId: '01',  
        code: 200, 
        msg: '포인트 조회 정상 처리 되었습니다.',
        body: {},
        error: {
          code: 0,
          msg: ''
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PointController;