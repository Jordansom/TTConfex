package com.Confex;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import com.mysql.cj.jdbc.AbandonedConnectionCleanupThread;

public class MyContextListener implements ServletContextListener {
    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        AbandonedConnectionCleanupThread.checkedShutdown();
    }

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        // Inicialización de recursos, si es necesario
    }
}
