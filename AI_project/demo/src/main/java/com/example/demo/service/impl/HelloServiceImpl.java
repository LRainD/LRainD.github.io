package com.example.demo.service.impl;

import com.example.demo.common.Result;
import com.example.demo.service.HelloService;
import org.springframework.stereotype.Service;

@Service
public class HelloServiceImpl implements HelloService {

    @Override
    public Result<String> sayHello() {
        return Result.success("Hello World");
    }
}
