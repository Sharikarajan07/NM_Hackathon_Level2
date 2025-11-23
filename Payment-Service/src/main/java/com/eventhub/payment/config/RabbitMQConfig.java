package com.eventhub.payment.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration
 * Configures exchange, queue, and bindings for payment messaging
 */
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.payment.exchange}")
    private String exchangeName;

    @Value("${rabbitmq.payment.queue}")
    private String queueName;

    @Value("${rabbitmq.payment.routing-key}")
    private String routingKey;

    /**
     * Topic Exchange for payment messages
     */
    @Bean
    public TopicExchange paymentExchange() {
        return new TopicExchange(exchangeName);
    }

    /**
     * Queue for payment messages
     */
    @Bean
    public Queue paymentQueue() {
        return new Queue(queueName, true); // durable queue
    }

    /**
     * Binding between exchange and queue with routing key
     */
    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange paymentExchange) {
        return BindingBuilder
                .bind(paymentQueue)
                .to(paymentExchange)
                .with(routingKey);
    }

    /**
     * Message converter to send/receive Java objects as JSON
     * Configured with JavaTimeModule to support Java 8 date/time types
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    /**
     * RabbitTemplate with JSON message converter
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
