process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { dbConnection } from '@/configs/dbConnection';
import Routes from '@/common/entity/routes.interface';
import errorMiddleware from '@/common/middlewares/error.middleware';
import { logger, stream } from '@/common/utils/logger';

class App {
  public app: express.Application;
  public port: string | number;
  public env: string;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.env = process.env.NODE_ENV || 'development';

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    connect(dbConnection.url, dbConnection.options);
  }

  private initializeMiddlewares() {
    // if (this.env === 'production') {
    //   this.app.use(morgan('combined', { stream }));
    //   this.app.use(cors({ origin: 'your.domain.com', credentials: true }));
    // } else {
    //   this.app.use(morgan('dev', { stream }));
    //   // this.app.use(cors({ origin: 'coffee-front.co.kr', credentials: true }));
    //   // this.app.use(cors());
    // }

    // 모든 도메인의 통신을 허용합니다.
    const issue2options = {
      origin: true,
      methods: ["POST"],
      credentials: true,
      maxAge: 3600
    };
    // 모든 options 메서드로의 사전 전달 접근을 허용합니다.
    this.app.options("*", cors(issue2options));

    this.app.use(hpp());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
     // 모든 도메인의 통신을 허용합니다.
     const issue2options = {
      origin: true,
      methods: ["POST"],
      credentials: true,
      maxAge: 3600
    };
    
    routes.forEach(route => {
      this.app.use('/', cors(issue2options), route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    this.app.use(helmet());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
