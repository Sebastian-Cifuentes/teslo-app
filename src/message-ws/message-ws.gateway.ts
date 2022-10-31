import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from 'src/auth/interfaces';
import { NewMessageDto } from './dto/new-message.dto';
import { MessageWsService } from './message-ws.service';

@WebSocketGateway({cors: true, namespace: '/'})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {

      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);

    } catch (err) {
      console.log(err);
      client.disconnect();
      return;
    }

    console.log({payload})

    // console.log('Cliente conectado: ', client.id);
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClient()); //clients-updated es como se llama el evento para poder escuchar desde el front

  }

  handleDisconnect(client: any) {
    // console.log('Cliente desconectado: ', client.id);
    this.messageWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messageWsService.getConnectedClient());
  }

  // message-from-client
  @SubscribeMessage('message-from-client') // nombre del evento que colocamos en el front
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {

    //! Emite unicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message!!'
    // })

    //! Emitir a todos, menos al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo!',
    //   message: payload.message || 'no-message!!'
    // })

    this.wss.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no-message!!'
    })

  }

  
}
